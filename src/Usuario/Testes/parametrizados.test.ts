import { UsuarioService } from '../service';
import { Repository } from 'typeorm';
import { RoleUsuario, Usuario } from '../entity';

const mockUsuarioRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
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

describe('UsuarioService (Testes Parametrizados)', () => {
  let usuarioService: UsuarioService;

  beforeEach(() => {
    jest.clearAllMocks();
    usuarioService = new UsuarioService(mockUsuarioRepository);
    (mockUsuarioRepository.save as jest.Mock).mockImplementation((user) => Promise.resolve(user));
  });

  describe('atualizarRoleDinamicamente (Teste Parametrizado)', () => {
    const casosDeTeste = [
      [true, true, RoleUsuario.AMBOS],
      [true, false, RoleUsuario.PROPRIETARIO],
      [false, true, RoleUsuario.CLIENTE],
      [false, false, RoleUsuario.CLIENTE],
    ];

    test.each(casosDeTeste)(
      'deve definir role como %s se temImovel=%s e temReserva=%s',
      async (temImovel, temReserva, roleEsperada) => {
        const roleInicial =
          roleEsperada === RoleUsuario.CLIENTE ? RoleUsuario.PROPRIETARIO : RoleUsuario.CLIENTE;

        const usuarioComRoleAntiga = {
          ...mockUsuario,
          role: roleInicial,
          imoveis: temImovel ? [{ id: 1 }] : [],
          reservas: temReserva ? [{ id: 1 }] : [],
        };

        (mockUsuarioRepository.findOne as jest.Mock).mockResolvedValue(usuarioComRoleAntiga);

        await usuarioService.atualizarRoleDinamicamente(1);

        expect(mockUsuarioRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 1,
            role: roleEsperada,
          }),
        );
      },
    );

    it('não deve salvar se a role já estiver correta', async () => {
      const usuarioComRoleCorreta = {
        ...mockUsuario,
        role: RoleUsuario.PROPRIETARIO,
        imoveis: [{ id: 1 }],
        reservas: [],
      };

      (mockUsuarioRepository.findOne as jest.Mock).mockResolvedValue(usuarioComRoleCorreta);

      await usuarioService.atualizarRoleDinamicamente(1);

      expect(mockUsuarioRepository.save).not.toHaveBeenCalled();
    });
  });
});
