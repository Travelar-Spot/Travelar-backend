import { Avaliacao } from '../entity';
import { AvaliacaoService } from '../service';
import { Usuario } from '../../Usuario/entity';
import { Imovel } from '../../Imovel/entity';
import { Repository } from 'typeorm';

const mockAvaliacaoRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
} as unknown as Repository<Avaliacao>;

const mockUsuarioRepository = {
  findOne: jest.fn(),
} as unknown as Repository<Usuario>;

const mockImovelRepository = {
  findOne: jest.fn(),
} as unknown as Repository<Imovel>;

const mockAutor: Usuario = { id: 1, nome: 'Autor Teste' } as Usuario;
const mockImovel: Imovel = { id: 10, titulo: 'Imóvel Teste' } as Imovel;

const mockAvaliacao: Avaliacao = {
  id: 100,
  nota: 5,
  comentario: 'Excelente!',
  autor: mockAutor,
  imovel: mockImovel,
};

const dadosNovaAvaliacao = {
  autorId: mockAutor.id,
  imovelId: mockImovel.id,
  nota: 5,
  comentario: 'Excelente!',
};

describe('AvaliacaoService (Testes Unitários)', () => {
  let avaliacaoService: AvaliacaoService;

  beforeEach(() => {
    jest.clearAllMocks();
    avaliacaoService = new AvaliacaoService(
      mockAvaliacaoRepository,
      mockUsuarioRepository,
      mockImovelRepository,
    );
  });

  it('deve ser instanciado corretamente', () => {
    expect(avaliacaoService).toBeInstanceOf(AvaliacaoService);
  });

  describe('criarAvaliacao', () => {
    it('deve criar uma avaliação com sucesso', async () => {
      (mockUsuarioRepository.findOne as jest.Mock).mockResolvedValue(mockAutor);
      (mockImovelRepository.findOne as jest.Mock).mockResolvedValue(mockImovel);

      (mockAvaliacaoRepository.create as jest.Mock).mockReturnValue({
        autor: mockAutor,
        imovel: mockImovel,
        nota: 5,
        comentario: 'Excelente!',
      });

      (mockAvaliacaoRepository.save as jest.Mock).mockResolvedValue(mockAvaliacao);

      const resultado = await avaliacaoService.criarAvaliacao(dadosNovaAvaliacao);

      expect(mockUsuarioRepository.findOne).toHaveBeenCalledWith({ where: { id: mockAutor.id } });
      expect(mockImovelRepository.findOne).toHaveBeenCalledWith({ where: { id: mockImovel.id } });
      expect(mockAvaliacaoRepository.create).toHaveBeenCalledWith({
        autor: mockAutor,
        imovel: mockImovel,
        nota: dadosNovaAvaliacao.nota,
        comentario: dadosNovaAvaliacao.comentario,
      });
      expect(mockAvaliacaoRepository.save).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(mockAvaliacao);
    });
  });

  describe('listarTodasAvaliacoes', () => {
    it('deve retornar uma lista de avaliações com relações', async () => {
      (mockAvaliacaoRepository.find as jest.Mock).mockResolvedValue([mockAvaliacao]);
      const resultado = await avaliacaoService.listarTodasAvaliacoes();

      expect(resultado).toEqual([mockAvaliacao]);
      expect(mockAvaliacaoRepository.find).toHaveBeenCalledWith({
        relations: ['autor', 'imovel'],
      });
    });
  });

  describe('listarAvaliacoesPorImovel', () => {
    it('deve retornar avaliações filtradas por imovelId', async () => {
      (mockAvaliacaoRepository.find as jest.Mock).mockResolvedValue([mockAvaliacao]);
      const imovelId = 10;
      const resultado = await avaliacaoService.listarAvaliacoesPorImovel(imovelId);

      expect(resultado).toEqual([mockAvaliacao]);
      expect(mockAvaliacaoRepository.find).toHaveBeenCalledWith({
        where: { imovel: { id: imovelId } },
        relations: ['autor', 'imovel'],
      });
    });
  });

  describe('listarAvaliacoesPorUsuario', () => {
    it('deve retornar avaliações filtradas por usuarioId (autorId)', async () => {
      (mockAvaliacaoRepository.find as jest.Mock).mockResolvedValue([mockAvaliacao]);
      const autorId = 1;
      const resultado = await avaliacaoService.listarAvaliacoesPorUsuario(autorId);

      expect(resultado).toEqual([mockAvaliacao]);
      expect(mockAvaliacaoRepository.find).toHaveBeenCalledWith({
        where: { autor: { id: autorId } },
        relations: ['autor', 'imovel'],
      });
    });
  });

  describe('excluirAvaliacao', () => {
    it('deve excluir uma avaliação com sucesso', async () => {
      (mockAvaliacaoRepository.findOne as jest.Mock).mockResolvedValue(mockAvaliacao);
      (mockAvaliacaoRepository.remove as jest.Mock).mockResolvedValue(undefined);

      await avaliacaoService.excluirAvaliacao(mockAvaliacao.id);

      expect(mockAvaliacaoRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockAvaliacao.id },
      });
      expect(mockAvaliacaoRepository.remove).toHaveBeenCalledWith(mockAvaliacao);
    });

    it('deve lançar erro se a avaliação não for encontrada', async () => {
      (mockAvaliacaoRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(avaliacaoService.excluirAvaliacao(999)).rejects.toThrow(
        'Avaliação não encontrada',
      );
      expect(mockAvaliacaoRepository.remove).not.toHaveBeenCalled();
    });
  });
});
