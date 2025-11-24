import { AppDataSource } from '../database/data-source';
import { Reserva, ReservaStatus } from './entity';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { UsuarioService } from '../Usuario/service';
import { ImovelService } from '../Imovel/service';
import { Usuario } from '../Usuario/entity';
import { Imovel } from '../Imovel/entity';

export class ReservaService {
  private readonly MILISSEGUNDOS_POR_DIA = 1000 * 60 * 60 * 24;

  constructor(
    private readonly reservaRepository: Repository<Reserva> = AppDataSource.getRepository(Reserva),
    private readonly usuarioService: UsuarioService = new UsuarioService(),
    private readonly imovelService: ImovelService = new ImovelService(),
  ) {}

  async criarReserva(
    dadosReserva: { imovelId: number; dataInicio: string; dataFim: string },
    idCliente: number,
  ): Promise<Reserva> {
    const clienteEncontrado = await this.usuarioService.buscarUsuarioPorId(idCliente);
    if (!clienteEncontrado) {
      throw new Error('Cliente autenticado não encontrado');
    }

    const imovelEncontrado = await this.imovelService.buscarImovelPorId(dadosReserva.imovelId);
    if (!imovelEncontrado) {
      throw new Error('Imóvel não encontrado');
    }

    if (!imovelEncontrado.disponivel) {
      throw new Error('Imóvel não está disponível para reserva');
    }

    const dataInicio = new Date(dadosReserva.dataInicio);
    const dataFim = new Date(dadosReserva.dataFim);

    this.validarOrdemDasDatas(dataInicio, dataFim);
    await this.verificarDisponibilidadeDeDatas(imovelEncontrado.id, dataInicio, dataFim);

    const valorTotal = this.calcularCustoEstadia(
      dataInicio,
      dataFim,
      imovelEncontrado.precoPorNoite,
    );

    const novaReserva = this.reservaRepository.create({
      cliente: clienteEncontrado,
      imovel: imovelEncontrado,
      dataInicio,
      dataFim,
      valorTotal,
      status: ReservaStatus.PENDENTE,
    });

    return this.reservaRepository.save(novaReserva);
  }

  async listarReservas(): Promise<Reserva[]> {
    return this.reservaRepository.find({
      relations: ['cliente', 'imovel', 'imovel.proprietario'],
    });
  }

  async listarReservasPorCliente(idCliente: number): Promise<Reserva[]> {
    return this.reservaRepository.find({
      where: { cliente: { id: idCliente } },
      relations: ['imovel', 'cliente'],
      order: { dataInicio: 'DESC' },
    });
  }

  async listarReservasPorProprietario(idProprietario: number): Promise<Reserva[]> {
    return this.reservaRepository.find({
      where: { imovel: { proprietario: { id: idProprietario } } },
      relations: ['cliente', 'imovel'],
      order: { criadoEm: 'DESC' },
    });
  }

  async buscarReservaPorId(idReserva: number): Promise<Reserva | null> {
    return this.reservaRepository.findOne({
      where: { id: idReserva },
      relations: ['cliente', 'imovel', 'imovel.proprietario'],
    });
  }

  async modificarReserva(
    idReserva: number,
    novasDatas: { dataInicio: string; dataFim: string },
    idCliente: number,
  ): Promise<Reserva> {
    const reservaEncontrada = await this.buscarReservaOuLancarErro(idReserva);

    this.validarAutorizacaoCliente(reservaEncontrada, idCliente);
    this.validarSeReservaPodeSerModificada(reservaEncontrada);

    const dataInicio = new Date(novasDatas.dataInicio);
    const dataFim = new Date(novasDatas.dataFim);

    this.validarOrdemDasDatas(dataInicio, dataFim);

    const valorTotalAtualizado = this.calcularCustoEstadia(
      dataInicio,
      dataFim,
      reservaEncontrada.imovel.precoPorNoite,
    );

    reservaEncontrada.dataInicio = dataInicio;
    reservaEncontrada.dataFim = dataFim;
    reservaEncontrada.valorTotal = valorTotalAtualizado;

    return this.reservaRepository.save(reservaEncontrada);
  }

  async excluirOuCancelarReserva(idReserva: number, idUsuarioSolicitante: number): Promise<void> {
    const reservaEncontrada = await this.buscarReservaOuLancarErro(idReserva);

    this.validarAutorizacaoCliente(reservaEncontrada, idUsuarioSolicitante);

    if (!this.isReservaAtiva(reservaEncontrada)) {
      throw new Error('Não é possível cancelar uma reserva já concluída ou cancelada.');
    }

    reservaEncontrada.status = ReservaStatus.CANCELADA_CLIENTE;
    await this.reservaRepository.save(reservaEncontrada);
  }

  async atualizarStatusReserva(
    idReserva: number,
    novoStatus: ReservaStatus,
    idProprietario: number,
  ): Promise<Reserva> {
    const reservaEncontrada = await this.buscarReservaOuLancarErro(idReserva);

    this.validarAutorizacaoProprietario(reservaEncontrada, idProprietario);
    this.validarTransicaoDeStatus(reservaEncontrada.status, novoStatus);

    reservaEncontrada.status = novoStatus;
    return this.reservaRepository.save(reservaEncontrada);
  }

  private async buscarReservaOuLancarErro(id: number): Promise<Reserva> {
    const reserva = await this.buscarReservaPorId(id);
    if (!reserva) {
      throw new Error('Reserva não encontrada');
    }
    return reserva;
  }

  private validarOrdemDasDatas(inicio: Date, fim: Date): void {
    if (inicio >= fim) {
      throw new Error('Data final deve ser posterior à data de início.');
    }
  }

  private async verificarDisponibilidadeDeDatas(
    imovelId: number,
    inicio: Date,
    fim: Date,
  ): Promise<void> {
    const conflitoExistente = await this.reservaRepository.findOne({
      where: {
        imovel: { id: imovelId },
        status: ReservaStatus.CONFIRMADA,
        dataInicio: LessThan(fim),
        dataFim: MoreThan(inicio),
      },
    });

    if (conflitoExistente) {
      throw new Error('Datas indisponíveis ou em conflito com outra reserva.');
    }
  }

  private calcularCustoEstadia(inicio: Date, fim: Date, precoPorNoite: number): number {
    const diferencaTempo = Math.abs(fim.getTime() - inicio.getTime());
    const diasEstadia = Math.ceil(diferencaTempo / this.MILISSEGUNDOS_POR_DIA);
    return diasEstadia * precoPorNoite;
  }

  private validarAutorizacaoCliente(reserva: Reserva, idCliente: number): void {
    if (reserva.cliente.id !== idCliente) {
      throw new Error('Permissão negada para modificar esta reserva');
    }
  }

  private validarAutorizacaoProprietario(reserva: Reserva, idProprietario: number): void {
    if (reserva.imovel.proprietario.id !== idProprietario) {
      throw new Error('Permissão negada: você não é o proprietário do imóvel desta reserva.');
    }
  }

  private isReservaAtiva(reserva: Reserva): boolean {
    return reserva.status === ReservaStatus.PENDENTE || reserva.status === ReservaStatus.CONFIRMADA;
  }

  private validarSeReservaPodeSerModificada(reserva: Reserva): void {
    if (!this.isReservaAtiva(reserva)) {
      throw new Error('Não é possível modificar uma reserva cancelada ou concluída.');
    }
  }

  private validarTransicaoDeStatus(statusAtual: ReservaStatus, novoStatus: ReservaStatus): void {
    const isTransicaoValida =
      statusAtual === ReservaStatus.PENDENTE &&
      (novoStatus === ReservaStatus.CONFIRMADA ||
        novoStatus === ReservaStatus.CANCELADA_PROPRIETARIO);

    if (!isTransicaoValida) {
      throw new Error(`Proprietário não pode mudar o status de ${statusAtual} para ${novoStatus}.`);
    }
  }
}
