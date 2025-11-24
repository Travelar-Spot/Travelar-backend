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

const dadosNovaAvaliacao = {
  autorId: mockAutor.id,
  imovelId: mockImovel.id,
  nota: 5,
  comentario: 'Excelente!',
};

describe('AvaliacaoService (Testes Parametrizados)', () => {
  let avaliacaoService: AvaliacaoService;

  beforeEach(() => {
    jest.clearAllMocks();
    avaliacaoService = new AvaliacaoService(
      mockAvaliacaoRepository,
      mockUsuarioRepository,
      mockImovelRepository,
    );
  });

  describe('criarAvaliacao - casos de falha', () => {
    const casosDeTeste: Array<[string, Usuario | null, Imovel | null]> = [
      ['Usuário (autor) não encontrado', null, mockImovel],
      ['Imóvel não encontrado', mockAutor, null],
    ];

    test.each(casosDeTeste)(
      'deve lançar erro "%s"',
      async (mensagemDeErro, mockAutorRetorno, mockImovelRetorno) => {
        (mockUsuarioRepository.findOne as jest.Mock).mockResolvedValue(mockAutorRetorno);
        (mockImovelRepository.findOne as jest.Mock).mockResolvedValue(mockImovelRetorno);

        await expect(avaliacaoService.criarAvaliacao(dadosNovaAvaliacao)).rejects.toThrow(
          mensagemDeErro,
        );

        expect(mockAvaliacaoRepository.save).not.toHaveBeenCalled();
      },
    );
  });
});
