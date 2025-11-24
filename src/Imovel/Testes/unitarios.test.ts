import { ImovelService } from '../service';
import { Imovel, TipoImovel } from '../entity';
import { Usuario } from '../../Usuario/entity';
import { UsuarioService } from '../../Usuario/service';
import { Repository } from 'typeorm';

const mockImovelRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
} as unknown as Repository<Imovel>;

const mockUsuarioRepository = {
  findOne: jest.fn(),
} as unknown as Repository<Usuario>;

const mockUsuarioService = {
  atualizarRoleDinamicamente: jest.fn(),
} as unknown as UsuarioService;

const mockUsuario: Usuario = { id: 1 } as Usuario;
const mockImovel: Imovel = {
  id: 1,
  titulo: 'Casa na Praia',
  cidade: 'Recife',
  tipo: TipoImovel.CASA,
  precoPorNoite: 300,
  capacidade: 5,
  proprietario: mockUsuario,
  reservas: [],
  avaliacoes: [],
} as Imovel;

describe('ImovelService (Testes Unitários)', () => {
  let service: ImovelService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ImovelService(mockImovelRepository, mockUsuarioRepository, mockUsuarioService);
  });

  it('deve ser instanciado corretamente', () => {
    expect(service).toBeInstanceOf(ImovelService);
  });

  describe('criarImovel', () => {
    it('deve criar um imóvel e atualizar a role do usuário', async () => {
      const dadosNovoImovel = { titulo: 'Novo Imóvel', cidade: 'SP' };
      const proprietarioId = 1;

      (mockImovelRepository.create as jest.Mock).mockReturnValue({
        ...dadosNovoImovel,
        proprietario: { id: proprietarioId },
      });

      (mockImovelRepository.save as jest.Mock).mockResolvedValue({
        id: 2,
        ...dadosNovoImovel,
        proprietario: { id: proprietarioId },
      });

      (mockUsuarioService.atualizarRoleDinamicamente as jest.Mock).mockResolvedValue(undefined);

      const resultado = await service.criarImovel(dadosNovoImovel, proprietarioId);

      expect(mockImovelRepository.create).toHaveBeenCalledWith({
        ...dadosNovoImovel,
        proprietario: { id: proprietarioId },
      });

      expect(mockImovelRepository.save).toHaveBeenCalledTimes(1);
      expect(mockUsuarioService.atualizarRoleDinamicamente).toHaveBeenCalledWith(proprietarioId);
      expect(resultado).toHaveProperty('id', 2);
      expect(resultado).toHaveProperty('titulo', 'Novo Imóvel');
    });

    it('deve lançar um erro se o ID do proprietário não for fornecido', async () => {
      await expect(service.criarImovel({}, 0)).rejects.toThrow(
        'ID do proprietário inválido ou ausente.',
      );
      await expect(service.criarImovel({}, undefined as any)).rejects.toThrow(
        'ID do proprietário inválido ou ausente.',
      );
    });
  });

  describe('buscarImovelPorId', () => {
    it('deve retornar um imóvel com todas as relações', async () => {
      (mockImovelRepository.findOne as jest.Mock).mockResolvedValue(mockImovel);

      const resultado = await service.buscarImovelPorId(1);

      expect(resultado).toEqual(mockImovel);
      expect(mockImovelRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: [
          'proprietario',
          'reservas',
          'avaliacoes',
          'reservas.cliente',
          'avaliacoes.autor',
        ],
      });
    });

    it('deve retornar null se não encontrar', async () => {
      (mockImovelRepository.findOne as jest.Mock).mockResolvedValue(null);
      const resultado = await service.buscarImovelPorId(99);
      expect(resultado).toBeNull();
    });
  });

  describe('excluirImovel', () => {
    it('deve excluir um imóvel e atualizar a role do proprietário', async () => {
      (mockImovelRepository.findOne as jest.Mock).mockResolvedValue(mockImovel);
      (mockImovelRepository.remove as jest.Mock).mockResolvedValue(undefined);
      (mockUsuarioService.atualizarRoleDinamicamente as jest.Mock).mockResolvedValue(undefined);

      await service.excluirImovel(1, mockImovel.proprietario.id);

      expect(mockImovelRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } }),
      );
      expect(mockImovelRepository.remove).toHaveBeenCalledWith(mockImovel);
      expect(mockUsuarioService.atualizarRoleDinamicamente).toHaveBeenCalledWith(
        mockImovel.proprietario.id,
      );
    });

    it('deve lançar um erro se o imóvel não for encontrado', async () => {
      (mockImovelRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.excluirImovel(99, 1)).rejects.toThrow('Imóvel não encontrado');
      expect(mockImovelRepository.remove).not.toHaveBeenCalled();
      expect(mockUsuarioService.atualizarRoleDinamicamente).not.toHaveBeenCalled();
    });

    it('deve lançar erro se usuário não for o proprietário', async () => {
      (mockImovelRepository.findOne as jest.Mock).mockResolvedValue(mockImovel);
      const idUsuarioInvasor = 999;

      await expect(service.excluirImovel(1, idUsuarioInvasor)).rejects.toThrow(
        'Permissão negada: Você não é o proprietário deste imóvel.',
      );
      expect(mockImovelRepository.remove).not.toHaveBeenCalled();
    });
  });
});
