import { Usuario } from '../../Usuario/entity';
import { Imovel } from '../../Imovel/entity';
import { Reserva, ReservaStatus } from '../entity';
import { ReservaService } from '../service';
import { Repository } from 'typeorm';
import { UsuarioService } from '../../Usuario/service';
import { ImovelService } from '../../Imovel/service';

const mockReservaRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
} as unknown as Repository<Reserva>;

const mockUsuarioService = {
  buscarUsuarioPorId: jest.fn(),
} as unknown as UsuarioService;

const mockImovelService = {
  buscarImovelPorId: jest.fn(),
} as unknown as ImovelService;

const mockCliente: Usuario = { id: 1, nome: 'Cliente Teste' } as Usuario;
const mockProprietario: Usuario = { id: 2, nome: 'Prop Teste' } as Usuario;

const mockImovel: Imovel = {
  id: 10,
  titulo: 'Casa Teste',
  disponivel: true,
  precoPorNoite: 150,
  proprietario: mockProprietario,
} as Imovel;

const mockReservaPendente: Reserva = {
  id: 100,
  cliente: mockCliente,
  imovel: mockImovel,
  status: ReservaStatus.PENDENTE,
  dataInicio: new Date('2025-12-01'),
  dataFim: new Date('2025-12-05'),
  valorTotal: 600,
} as Reserva;

describe('ReservaService (Testes Unitários)', () => {
  let service: ReservaService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReservaService(mockReservaRepository, mockUsuarioService, mockImovelService);
  });

  it('deve ser instanciado corretamente', () => {
    expect(service).toBeInstanceOf(ReservaService);
  });

  describe('criarReserva (Validações)', () => {
    const dadosReserva = {
      imovelId: 10,
      dataInicio: '2025-12-01',
      dataFim: '2025-12-05',
    };

    beforeEach(() => {
      (mockUsuarioService.buscarUsuarioPorId as jest.Mock).mockResolvedValue(mockCliente);
      (mockImovelService.buscarImovelPorId as jest.Mock).mockResolvedValue(mockImovel);
      (mockReservaRepository.create as jest.Mock).mockImplementation((dados) => dados as Reserva);
      (mockReservaRepository.save as jest.Mock).mockImplementation((reserva) =>
        Promise.resolve(reserva),
      );
      (mockReservaRepository.findOne as jest.Mock).mockResolvedValue(null);
    });

    it('deve lançar erro se cliente não for encontrado', async () => {
      (mockUsuarioService.buscarUsuarioPorId as jest.Mock).mockResolvedValue(null);
      await expect(service.criarReserva(dadosReserva, 99)).rejects.toThrow(
        'Cliente autenticado não encontrado',
      );
    });

    it('deve lançar erro se imóvel não for encontrado', async () => {
      (mockImovelService.buscarImovelPorId as jest.Mock).mockResolvedValue(null);
      await expect(service.criarReserva(dadosReserva, mockCliente.id)).rejects.toThrow(
        'Imóvel não encontrado',
      );
    });

    it('deve lançar erro se imóvel não estiver disponível', async () => {
      (mockImovelService.buscarImovelPorId as jest.Mock).mockResolvedValue({
        ...mockImovel,
        disponivel: false,
      });
      await expect(service.criarReserva(dadosReserva, mockCliente.id)).rejects.toThrow(
        'Imóvel não está disponível para reserva',
      );
    });

    it('deve lançar erro se data final for anterior à inicial', async () => {
      const dadosDataInvalida = {
        ...dadosReserva,
        dataInicio: '2025-12-10',
        dataFim: '2025-12-05',
      };
      await expect(service.criarReserva(dadosDataInvalida, mockCliente.id)).rejects.toThrow(
        'Data final deve ser posterior à data de início.',
      );
    });

    it('deve lançar erro se houver conflito de datas', async () => {
      (mockReservaRepository.findOne as jest.Mock).mockResolvedValue(mockReservaPendente);
      await expect(service.criarReserva(dadosReserva, mockCliente.id)).rejects.toThrow(
        'Datas indisponíveis ou em conflito com outra reserva.',
      );
    });
  });

  describe('listarReservasPorCliente', () => {
    it('deve chamar o find com o where correto', async () => {
      (mockReservaRepository.find as jest.Mock).mockResolvedValue([mockReservaPendente]);
      const resultado = await service.listarReservasPorCliente(mockCliente.id);

      expect(mockReservaRepository.find).toHaveBeenCalledWith({
        where: { cliente: { id: mockCliente.id } },
        relations: ['imovel', 'cliente'],
        order: { dataInicio: 'DESC' },
      });
      expect(resultado.length).toBe(1);
    });
  });

  describe('listarReservasPorProprietario', () => {
    it('deve chamar o find com o where correto', async () => {
      (mockReservaRepository.find as jest.Mock).mockResolvedValue([mockReservaPendente]);
      const resultado = await service.listarReservasPorProprietario(mockProprietario.id);

      expect(mockReservaRepository.find).toHaveBeenCalledWith({
        where: { imovel: { proprietario: { id: mockProprietario.id } } },
        relations: ['cliente', 'imovel'],
        order: { criadoEm: 'DESC' },
      });
      expect(resultado.length).toBe(1);
    });
  });

  describe('excluirOuCancelarReserva', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      (mockReservaRepository.findOne as jest.Mock).mockResolvedValue({ ...mockReservaPendente });
      (mockReservaRepository.save as jest.Mock).mockImplementation((reserva) =>
        Promise.resolve(reserva),
      );
    });
    it('deve mudar status para CANCELADA_CLIENTE se o cliente for o dono', async () => {
      await service.excluirOuCancelarReserva(mockReservaPendente.id, mockCliente.id);

      expect(mockReservaRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockReservaPendente.id,
          status: ReservaStatus.CANCELADA_CLIENTE,
        }),
      );
    });

    it('deve lançar erro se o usuário não for o cliente', async () => {
      const idUsuarioErrado = 99;
      await expect(
        service.excluirOuCancelarReserva(mockReservaPendente.id, idUsuarioErrado),
      ).rejects.toThrow('Permissão negada para modificar esta reserva');
    });

    it('deve lançar erro se a reserva não for PENDENTE ou CONFIRMADA', async () => {
      const reservaConcluida = { ...mockReservaPendente, status: ReservaStatus.CONCLUIDA };
      (mockReservaRepository.findOne as jest.Mock).mockResolvedValue(reservaConcluida);

      await expect(
        service.excluirOuCancelarReserva(reservaConcluida.id, mockCliente.id),
      ).rejects.toThrow('Não é possível cancelar uma reserva já concluída ou cancelada.');
    });
  });
});
