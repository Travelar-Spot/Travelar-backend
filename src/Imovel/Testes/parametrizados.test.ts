import { ImovelService, ImovelFiltros } from '../service';
import { Imovel, TipoImovel } from '../entity';
import { Usuario } from '../../Usuario/entity';
import { UsuarioService } from '../../Usuario/service';
import { Repository, MoreThanOrEqual, LessThanOrEqual, Between, In } from 'typeorm';

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

describe('ImovelService (Testes Parametrizados)', () => {
  let service: ImovelService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ImovelService(mockImovelRepository, mockUsuarioRepository, mockUsuarioService);
  });

  describe('listarImoveis (Testes Parametrizados de Filtro)', () => {
    const casosDeTeste: [string, ImovelFiltros, any][] = [
      ['sem filtros', {}, {}],
      ['por cidade', { cidade: 'Recife' }, { cidade: 'Recife' }],
      [
        'por tipos (plural)',
        { tipos: [TipoImovel.CASA, TipoImovel.APARTAMENTO] },
        { tipo: In([TipoImovel.CASA, TipoImovel.APARTAMENTO]) },
      ],
      ['por capacidade', { capacidade: 4 }, { capacidade: MoreThanOrEqual(4) }],
      [
        'por minPreco e maxPreco',
        { minPreco: 100, maxPreco: 500 },
        { precoPorNoite: Between(100, 500) },
      ],
      ['por minPreco', { minPreco: 150 }, { precoPorNoite: MoreThanOrEqual(150) }],
      ['por maxPreco', { maxPreco: 250 }, { precoPorNoite: LessThanOrEqual(250) }],
      [
        'combinação complexa',
        { cidade: 'Natal', capacidade: 2, minPreco: 50, maxPreco: 150 },
        {
          cidade: 'Natal',
          capacidade: MoreThanOrEqual(2),
          precoPorNoite: Between(50, 150),
        },
      ],
    ];

    test.each(casosDeTeste)(
      'deve montar a query correta para filtros: %s',
      async (_nomeDoTeste, filtros, expectedWhere) => {
        (mockImovelRepository.find as jest.Mock).mockResolvedValue([]);

        await service.listarImoveis(filtros as ImovelFiltros);

        expect(mockImovelRepository.find).toHaveBeenCalledWith({
          where: expectedWhere,
          relations: ['proprietario', 'reservas', 'avaliacoes'],
        });
      },
    );
  });
});
