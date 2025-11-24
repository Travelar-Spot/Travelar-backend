import request from 'supertest';
import app from '../../app';
import { AppDataSource } from '../../database/data-source';
import { Usuario, RoleUsuario } from '../../Usuario/entity';
import { Imovel, TipoImovel } from '../entity';
import jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';

describe('Imovel API (Testes de Integração)', () => {
  let usuarioRepository: Repository<Usuario>;
  let imovelRepository: Repository<Imovel>;

  let proprietarioUsuario: Usuario;
  let outroUsuario: Usuario;
  let tokenProprietario: string;
  let tokenOutroUsuario: string;

  let imovelDoProprietario: Imovel;
  let imovelDoOutro: Imovel;

  const jwtSecret = process.env.JWT_SECRET!;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    usuarioRepository = AppDataSource.getRepository(Usuario);
    imovelRepository = AppDataSource.getRepository(Imovel);
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  beforeEach(async () => {
    await usuarioRepository.query('TRUNCATE TABLE usuarios RESTART IDENTITY CASCADE');
    await imovelRepository.query('TRUNCATE TABLE imoveis RESTART IDENTITY CASCADE');

    proprietarioUsuario = await usuarioRepository.save({
      nome: 'Proprietário Teste',
      email: 'proprietario@teste.com',
      telefone: '111',
      role: RoleUsuario.CLIENTE,
      senhaHash: 'hash-fake-1',
    });

    outroUsuario = await usuarioRepository.save({
      nome: 'Outro Usuário',
      email: 'outro@teste.com',
      telefone: '222',
      role: RoleUsuario.CLIENTE,
      senhaHash: 'hash-fake-2',
    });

    imovelDoProprietario = await imovelRepository.save({
      titulo: 'Casa em Brasília',
      cidade: 'Brasília',
      tipo: TipoImovel.CASA,
      precoPorNoite: 150,
      capacidade: 5,
      proprietario: { id: proprietarioUsuario.id },
      descricao: 'Casa de teste para o proprietário',
      endereco: 'Endereço de teste, 123',
    });

    imovelDoOutro = await imovelRepository.save({
      titulo: 'Apartamento em Goiânia',
      cidade: 'Goiânia',
      tipo: TipoImovel.APARTAMENTO,
      precoPorNoite: 100,
      capacidade: 2,
      proprietario: { id: outroUsuario.id },
      descricao: 'Apto de teste para o outro usuário',
      endereco: 'Endereço de teste, 456',
    });

    tokenProprietario = jwt.sign(
      { sub: proprietarioUsuario.id, role: proprietarioUsuario.role },
      jwtSecret,
      { expiresIn: '1h' },
    );
    tokenOutroUsuario = jwt.sign({ sub: outroUsuario.id, role: outroUsuario.role }, jwtSecret, {
      expiresIn: '1h',
    });
  });

  describe('POST /imoveis', () => {
    const novoImovelDados = {
      titulo: 'Chácara em Pirenópolis',
      cidade: 'Pirenópolis',
      tipo: TipoImovel.CHACARA,
      endereco: 'Rua das Flores, 123',
      descricao: 'Linda chácara',
      precoPorNoite: 500,
      capacidade: 10,
    };

    it('deve retornar 401 se não estiver autenticado', async () => {
      const res = await request(app).post('/imoveis').send(novoImovelDados);
      expect(res.status).toBe(401);
    });

    it('deve retornar 201 e criar o imóvel se autenticado', async () => {
      const res = await request(app)
        .post('/imoveis')
        .set('Authorization', `Bearer ${tokenProprietario}`)
        .send(novoImovelDados);

      expect(res.status).toBe(201);
      expect(res.body.titulo).toBe(novoImovelDados.titulo);
      expect(res.body.proprietario.id).toBe(proprietarioUsuario.id);
    });

    it('deve atualizar a role do usuário para PROPRIETARIO após criar o primeiro imóvel', async () => {
      const novoUsuario = await usuarioRepository.save({
        nome: 'Futuro Prop',
        email: 'futuro@teste.com',
        telefone: '333',
        role: RoleUsuario.CLIENTE,
        senhaHash: 'hash-fake-3',
      });
      const tokenNovoUsuario = jwt.sign(
        { sub: novoUsuario.id, role: novoUsuario.role },
        jwtSecret,
        { expiresIn: '1h' },
      );
      expect(novoUsuario.role).toBe(RoleUsuario.CLIENTE);

      await request(app)
        .post('/imoveis')
        .set('Authorization', `Bearer ${tokenNovoUsuario}`)
        .send(novoImovelDados);

      const usuarioAtualizado = await usuarioRepository.findOneBy({ id: novoUsuario.id });
      expect(usuarioAtualizado?.role).toBe(RoleUsuario.PROPRIETARIO);
    });
  });

  describe('GET /imoveis (Filtros)', () => {
    it('deve retornar 200 e todos os 2 imóveis sem filtro', async () => {
      const res = await request(app).get('/imoveis');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });

    it('deve filtrar por cidade', async () => {
      const res = await request(app).get('/imoveis?cidade=Brasília');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].titulo).toBe('Casa em Brasília');
    });

    it('deve filtrar por tipo', async () => {
      const res = await request(app).get('/imoveis?tipo=APARTAMENTO');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].titulo).toBe('Apartamento em Goiânia');
    });

    it('deve filtrar por tipos múltiplos (CSV)', async () => {
      const res = await request(app).get('/imoveis?tipo=CASA,APARTAMENTO');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });

    it('deve filtrar por capacidade mínima', async () => {
      const res = await request(app).get('/imoveis?capacidade=3');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].capacidade).toBe(5);
    });

    it('deve filtrar por minPreco', async () => {
      const res = await request(app).get('/imoveis?minPreco=120');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].precoPorNoite).toBe('150.00');
    });

    it('deve filtrar por maxPreco', async () => {
      const res = await request(app).get('/imoveis?maxPreco=120');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].precoPorNoite).toBe('100.00');
    });

    it('deve retornar 400 para capacidade inválida', async () => {
      const res = await request(app).get('/imoveis?capacidade=abc');
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Capacidade inválida.');
    });

    it('deve retornar 400 para minPreco inválido', async () => {
      const res = await request(app).get('/imoveis?minPreco=xyz');
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Preço mínimo inválido.');
    });
  });

  describe('GET /imoveis/:id', () => {
    it('deve retornar 200 e o imóvel correto', async () => {
      const res = await request(app).get(`/imoveis/${imovelDoProprietario.id}`);
      expect(res.status).toBe(200);
      expect(res.body.titulo).toBe(imovelDoProprietario.titulo);
    });

    it('deve retornar 404 se o imóvel não existir', async () => {
      const res = await request(app).get('/imoveis/999');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /imoveis/:id (Autorização)', () => {
    const dadosUpdate = { titulo: 'Título Atualizado' };

    it('deve retornar 401 se não estiver autenticado', async () => {
      const res = await request(app).put(`/imoveis/${imovelDoProprietario.id}`).send(dadosUpdate);
      expect(res.status).toBe(401);
    });

    it('deve retornar 403 (Forbidden) se tentar atualizar imóvel de outro usuário', async () => {
      const res = await request(app)
        .put(`/imoveis/${imovelDoOutro.id}`)
        .set('Authorization', `Bearer ${tokenProprietario}`)
        .send(dadosUpdate);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Permissão negada: Você não é o proprietário deste imóvel.');
    });

    it('deve retornar 404 se o imóvel não existir', async () => {
      const res = await request(app)
        .put('/imoveis/999')
        .set('Authorization', `Bearer ${tokenProprietario}`)
        .send(dadosUpdate);
      expect(res.status).toBe(404);
    });

    it('deve retornar 200 e atualizar o imóvel se for o proprietário', async () => {
      const res = await request(app)
        .put(`/imoveis/${imovelDoProprietario.id}`)
        .set('Authorization', `Bearer ${tokenProprietario}`)
        .send(dadosUpdate);

      expect(res.status).toBe(200);
      expect(res.body.titulo).toBe(dadosUpdate.titulo);

      const imovelDoBanco = await imovelRepository.findOneBy({
        id: imovelDoProprietario.id,
      });
      expect(imovelDoBanco?.titulo).toBe(dadosUpdate.titulo);
    });
  });

  describe('DELETE /imoveis/:id (Autorização)', () => {
    it('deve retornar 401 se não estiver autenticado', async () => {
      const res = await request(app).delete(`/imoveis/${imovelDoProprietario.id}`);
      expect(res.status).toBe(401);
    });

    it('deve retornar 403 (Forbidden) se tentar excluir imóvel de outro usuário', async () => {
      const res = await request(app)
        .delete(`/imoveis/${imovelDoOutro.id}`)
        .set('Authorization', `Bearer ${tokenProprietario}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Permissão negada: Você não é o proprietário deste imóvel.');
    });

    it('deve retornar 404 se o imóvel não existir', async () => {
      const res = await request(app)
        .delete('/imoveis/999')
        .set('Authorization', `Bearer ${tokenProprietario}`);
      expect(res.status).toBe(404);
    });

    it('deve retornar 204 e excluir o imóvel se for o proprietário', async () => {
      const res = await request(app)
        .delete(`/imoveis/${imovelDoProprietario.id}`)
        .set('Authorization', `Bearer ${tokenProprietario}`);

      expect(res.status).toBe(204);

      const imovelDoBanco = await imovelRepository.findOneBy({
        id: imovelDoProprietario.id,
      });
      expect(imovelDoBanco).toBeNull();
    });
  });
});
