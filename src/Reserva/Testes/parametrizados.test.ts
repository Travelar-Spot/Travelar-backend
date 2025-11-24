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

describe('ReservaService (Testes Parametrizados)', () => {
  let service: ReservaService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReservaService(mockReservaRepository, mockUsuarioService, mockImovelService);
  });

  describe('criarReserva (Cálculo de Valor)', () => {
    beforeEach(() => {
      (mockUsuarioService.buscarUsuarioPorId as jest.Mock).mockResolvedValue(mockCliente);
      (mockImovelService.buscarImovelPorId as jest.Mock).mockResolvedValue(mockImovel);
      (mockReservaRepository.create as jest.Mock).mockImplementation((dados) => dados as Reserva);
      (mockReservaRepository.save as jest.Mock).mockImplementation((reserva) =>
        Promise.resolve(reserva),
      );
      (mockReservaRepository.findOne as jest.Mock).mockResolvedValue(null);
    });

    describe('cálculo de valorTotal (Teste Parametrizado)', () => {
      const casosDeTeste = [
        ['2025-12-01', '2025-12-05', 150, 4, 600],
        ['2025-01-01', '2025-01-02', 100, 1, 100],
        ['2025-02-10', '2025-02-17', 50, 7, 350],
        ['2025-06-01', '2025-06-03', 220, 2, 440],
      ];

      test.each(casosDeTeste)(
        'deve calcular valorTotal como %p para %p dias (preco %p)',
        async (dataInicio, dataFim, precoPorNoite, _diasEsperados, totalEsperado) => {
          const imovelComPreco = { ...mockImovel, precoPorNoite: precoPorNoite as number };
          (mockImovelService.buscarImovelPorId as jest.Mock).mockResolvedValue(imovelComPreco);
          (mockUsuarioService.buscarUsuarioPorId as jest.Mock).mockResolvedValue(mockCliente);

          const dados = {
            imovelId: 10,
            dataInicio: dataInicio as string,
            dataFim: dataFim as string,
          };

          const resultado = await service.criarReserva(dados, mockCliente.id);

          expect(mockReservaRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
              valorTotal: totalEsperado,
              status: ReservaStatus.PENDENTE,
              cliente: mockCliente,
              imovel: imovelComPreco,
            }),
          );
          expect(mockReservaRepository.save).toHaveBeenCalledTimes(1);
          expect(resultado.valorTotal).toBe(totalEsperado);
        },
      );
    });
  });

  describe('atualizarStatusReserva (Teste Parametrizado de State Machine)', () => {
    const casosDeTesteProprietario = [
      [ReservaStatus.PENDENTE, ReservaStatus.CONFIRMADA, true],
      [ReservaStatus.PENDENTE, ReservaStatus.CANCELADA_PROPRIETARIO, true],
      [ReservaStatus.PENDENTE, ReservaStatus.CONCLUIDA, false],
      [ReservaStatus.PENDENTE, ReservaStatus.CANCELADA_CLIENTE, false],
      [ReservaStatus.PENDENTE, ReservaStatus.PENDENTE, false],
      [ReservaStatus.CONFIRMADA, ReservaStatus.PENDENTE, false],
      [ReservaStatus.CONCLUIDA, ReservaStatus.CONFIRMADA, false],
      [ReservaStatus.CANCELADA_CLIENTE, ReservaStatus.CONFIRMADA, false],
    ];

    test.each(casosDeTesteProprietario)(
      'deve (sucesso=%p) para proprietário mudar de %s para %s',
      async (statusAtual, novoStatus, deveTerSucesso) => {
        const reservaComStatus = {
          ...mockReservaPendente,
          status: statusAtual as ReservaStatus,
        };
        (mockReservaRepository.findOne as jest.Mock).mockResolvedValue(reservaComStatus);
        (mockReservaRepository.save as jest.Mock).mockImplementation((res) => Promise.resolve(res));

        if (deveTerSucesso) {
          const resultado = await service.atualizarStatusReserva(
            mockReservaPendente.id,
            novoStatus as ReservaStatus,
            mockProprietario.id,
          );
          expect(resultado.status).toBe(novoStatus);
          expect(mockReservaRepository.save).toHaveBeenCalledTimes(1);
        } else {
          await expect(
            service.atualizarStatusReserva(
              mockReservaPendente.id,
              novoStatus as ReservaStatus,
              mockProprietario.id,
            ),
          ).rejects.toThrow(
            `Proprietário não pode mudar o status de ${statusAtual} para ${novoStatus}.`,
          );
          expect(mockReservaRepository.save).not.toHaveBeenCalled();
        }
      },
    );

    it('deve lançar erro se o usuário não for o proprietário', async () => {
      (mockReservaRepository.findOne as jest.Mock).mockResolvedValue(mockReservaPendente);
      const idUsuarioErrado = mockCliente.id;
      await expect(
        service.atualizarStatusReserva(
          mockReservaPendente.id,
          ReservaStatus.CONFIRMADA,
          idUsuarioErrado,
        ),
      ).rejects.toThrow('Permissão negada: você não é o proprietário do imóvel desta reserva.');
    });
  });
});
