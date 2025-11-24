import { UsuarioService } from '../service';
import { Repository } from 'typeorm';
import { RoleUsuario, Usuario } from '../entity';

const mockUsuarioRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
} as unknown as Repository<Usuario>;

const mockUsuario: Usuario = {
  id: 1,
  nome: 'Usuário Teste',
  email: 'teste@exemplo.com',
  telefone: '123456789',
  role: RoleUsuario.CLIENTE,
  criadoEm: new Date(),
  senhaHash: 'hash-secreto',
  imoveis: [],
  reservas: [],
  avaliacoes: [],
  foto: '',
};

describe('UsuarioService (Testes Unitários)', () => {
  let usuarioService: UsuarioService;

  beforeEach(() => {
    jest.clearAllMocks();
    usuarioService = new UsuarioService(mockUsuarioRepository);
  });

  it('deve ser instanciado corretamente', () => {
    expect(usuarioService).toBeInstanceOf(UsuarioService);
  });

  describe('listarUsuarios', () => {
    it('deve retornar uma lista de usuários', async () => {
      const listaUsuarios = [mockUsuario];
      (mockUsuarioRepository.find as jest.Mock).mockResolvedValue(listaUsuarios);

      const resultado = await usuarioService.listarUsuarios();

      expect(resultado).toEqual(listaUsuarios);
      expect(mockUsuarioRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('buscarUsuarioPorId', () => {
    it('deve retornar um usuário se ele for encontrado', async () => {
      (mockUsuarioRepository.findOne as jest.Mock).mockResolvedValue(mockUsuario);

      const resultado = await usuarioService.buscarUsuarioPorId(1);

      expect(resultado).toEqual(mockUsuario);
      expect(mockUsuarioRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['imoveis', 'reservas'],
      });
    });

    it('deve retornar null se o usuário não for encontrado', async () => {
      (mockUsuarioRepository.findOne as jest.Mock).mockResolvedValue(null);

      const resultado = await usuarioService.buscarUsuarioPorId(99);

      expect(resultado).toBeNull();
      expect(mockUsuarioRepository.findOne).toHaveBeenCalledWith({
        where: { id: 99 },
        relations: ['imoveis', 'reservas'],
      });
    });
  });

  describe('atualizarUsuario', () => {
    it('deve atualizar nome e telefone do usuário', async () => {
      const dadosAtualizacao = { nome: 'Nome Atualizado', telefone: '987654321' };
      const usuarioOriginal = { ...mockUsuario };
      const usuarioEsperado = { ...usuarioOriginal, ...dadosAtualizacao };

      (mockUsuarioRepository.findOneBy as jest.Mock).mockResolvedValue(usuarioOriginal);
      (mockUsuarioRepository.save as jest.Mock).mockResolvedValue(usuarioEsperado);

      const resultado = await usuarioService.atualizarUsuario(1, dadosAtualizacao);

      expect(mockUsuarioRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockUsuarioRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          nome: 'Nome Atualizado',
          telefone: '987654321',
        }),
      );
      expect(resultado).toEqual(usuarioEsperado);
    });

    it('deve atualizar apenas o nome', async () => {
      const dadosAtualizacao = { nome: 'Apenas Nome' };
      const usuarioOriginal = { ...mockUsuario, telefone: '123456789' };

      (mockUsuarioRepository.findOneBy as jest.Mock).mockResolvedValue(usuarioOriginal);
      (mockUsuarioRepository.save as jest.Mock).mockImplementation((user) => Promise.resolve(user));

      await usuarioService.atualizarUsuario(1, dadosAtualizacao);

      expect(mockUsuarioRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          nome: 'Apenas Nome',
          telefone: '123456789',
        }),
      );
    });

    it('deve lançar um erro se o usuário não for encontrado', async () => {
      (mockUsuarioRepository.findOneBy as jest.Mock).mockResolvedValue(null);
      const dadosAtualizacao = { nome: 'Nome Novo' };

      await expect(usuarioService.atualizarUsuario(99, dadosAtualizacao)).rejects.toThrow(
        'Usuário não encontrado',
      );
    });
  });
});
