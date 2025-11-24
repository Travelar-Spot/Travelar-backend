import request from 'supertest';
import app from '../../app';
import { AppDataSource } from '../../database/data-source';
import { Usuario, RoleUsuario } from '../entity';
import jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';

describe('Usuario API (Testes de Integração)', () => {
  jest.setTimeout(30000);
  let usuarioRepository: Repository<Usuario>;
  let tokenUsuarioComum: string;
  let tokenOutroUsuario: string;
  let usuarioComum: Usuario;
  let outroUsuario: Usuario;
  const jwtSecret = process.env.JWT_SECRET!;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    usuarioRepository = AppDataSource.getRepository(Usuario);
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  beforeEach(async () => {
    await usuarioRepository.query('TRUNCATE TABLE usuarios RESTART IDENTITY CASCADE');

    usuarioComum = await usuarioRepository.save({
      nome: 'Usuario Comum',
      email: 'comum@teste.com',
      telefone: '111111',
      role: RoleUsuario.CLIENTE,
      senhaHash: 'hash-fake-1',
    });

    outroUsuario = await usuarioRepository.save({
      nome: 'Outro Usuario',
      email: 'outro@teste.com',
      telefone: '222222',
      role: RoleUsuario.PROPRIETARIO,
      senhaHash: 'hash-fake-2',
    });

    tokenUsuarioComum = jwt.sign(
      { sub: usuarioComum.id, email: usuarioComum.email, role: usuarioComum.role },
      jwtSecret,
      { expiresIn: '1h' },
    );

    tokenOutroUsuario = jwt.sign(
      { sub: outroUsuario.id, email: outroUsuario.email, role: outroUsuario.role },
      jwtSecret,
      { expiresIn: '1h' },
    );
  });

  describe('GET /usuarios', () => {
    it('não deve retornar a senhaHash na lista de usuários', async () => {
      const res = await request(app).get('/usuarios');
      expect(res.status).toBe(200);
      expect(res.body[0].senhaHash).toBeUndefined();
    });
  });

  describe('GET /usuarios/:id', () => {
    it('deve retornar 200 e o usuário correto', async () => {
      const res = await request(app).get(`/usuarios/${outroUsuario.id}`);
      expect(res.status).toBe(200);
      expect(res.body.nome).toBe(outroUsuario.nome);
      expect(res.body.email).toBe(outroUsuario.email);
    });

    it('deve retornar 404 se o usuário não for encontrado', async () => {
      const res = await request(app).get('/usuarios/9999');
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Usuário não encontrado');
    });

    it('deve retornar 400 se o ID for inválido', async () => {
      const res = await request(app).get('/usuarios/abc');
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('ID inválido');
    });

    it('não deve retornar a senhaHash ao buscar por ID', async () => {
      const res = await request(app).get(`/usuarios/${usuarioComum.id}`);
      expect(res.status).toBe(200);
      expect(res.body.senhaHash).toBeUndefined();
    });
  });

  describe('PUT /usuarios/:id', () => {
    const dadosAtualizacao = {
      nome: 'Nome Atualizado Pela API',
      telefone: '999999',
    };

    it('deve retornar 401 se não estiver autenticado', async () => {
      const res = await request(app).put(`/usuarios/${usuarioComum.id}`).send(dadosAtualizacao);
      expect(res.status).toBe(401);
    });

    it('deve retornar 403 se tentar atualizar outro usuário', async () => {
      const res = await request(app)
        .put(`/usuarios/${outroUsuario.id}`)
        .set('Authorization', `Bearer ${tokenUsuarioComum}`)
        .send(dadosAtualizacao);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Permissão negada: Você só pode editar seu próprio perfil.');
    });

    it('deve retornar 404 se o usuário a ser atualizado não existir', async () => {
      const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
      const tokenUsuarioFalso = jwt.sign({ sub: 999 }, process.env.JWT_SECRET!);

      const res = await request(app)
        .put('/usuarios/999')
        .set('Authorization', `Bearer ${tokenUsuarioFalso}`)
        .send(dadosAtualizacao);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Usuário não encontrado');
      consoleErrorMock.mockRestore();
    });

    it('deve retornar 200 e atualizar o usuário com sucesso', async () => {
      const res = await request(app)
        .put(`/usuarios/${usuarioComum.id}`)
        .set('Authorization', `Bearer ${tokenUsuarioComum}`)
        .send(dadosAtualizacao);

      expect(res.status).toBe(200);
      expect(res.body.nome).toBe(dadosAtualizacao.nome);
      expect(res.body.telefone).toBe(dadosAtualizacao.telefone);
      expect(res.body.email).toBe(usuarioComum.email);
      expect(res.body.senhaHash).toBeUndefined();

      const usuarioDoBanco = await usuarioRepository.findOneBy({ id: usuarioComum.id });
      expect(usuarioDoBanco?.nome).toBe(dadosAtualizacao.nome);
    });

    it('não deve atualizar campos não permitidos (ex: email, role)', async () => {
      const dadosMaliciosos = {
        nome: 'Nome OK',
        telefone: 'Fone OK',
        email: 'email-malicioso@teste.com',
        role: RoleUsuario.AMBOS,
      };

      const res = await request(app)
        .put(`/usuarios/${usuarioComum.id}`)
        .set('Authorization', `Bearer ${tokenUsuarioComum}`)
        .send(dadosMaliciosos);

      expect(res.status).toBe(200);
      expect(res.body.nome).toBe('Nome OK');
      expect(res.body.email).toBe(usuarioComum.email);
      expect(res.body.role).toBe(usuarioComum.role);

      const usuarioDoBanco = await usuarioRepository.findOneBy({ id: usuarioComum.id });
      expect(usuarioDoBanco?.email).toBe(usuarioComum.email);
    });
  });
});
