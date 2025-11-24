import request from 'supertest';
import app from '../../app';
import { AppDataSource } from '../../database/data-source';
import { Usuario, RoleUsuario } from '../../Usuario/entity';
import { Imovel, TipoImovel } from '../../Imovel/entity';
import { Avaliacao } from '../entity';
import jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';

describe('Avaliacao API (Testes de Integração)', () => {
  let usuarioRepository: Repository<Usuario>;
  let imovelRepository: Repository<Imovel>;
  let avaliacaoRepository: Repository<Avaliacao>;

  let usuarioAutor: Usuario;
  let outroUsuario: Usuario;
  let imovelAvaliado: Imovel;
  let avaliacaoExistente: Avaliacao;

  let tokenAutor: string;
  let tokenOutroUsuario: string;

  const jwtSecret = process.env.JWT_SECRET!;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    usuarioRepository = AppDataSource.getRepository(Usuario);
    imovelRepository = AppDataSource.getRepository(Imovel);
    avaliacaoRepository = AppDataSource.getRepository(Avaliacao);
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  beforeEach(async () => {
    await usuarioRepository.query('TRUNCATE TABLE usuarios RESTART IDENTITY CASCADE');
    await imovelRepository.query('TRUNCATE TABLE imoveis RESTART IDENTITY CASCADE');
    await avaliacaoRepository.query('TRUNCATE TABLE avaliacoes RESTART IDENTITY CASCADE');

    usuarioAutor = await usuarioRepository.save({
      nome: 'Autor da Avaliação',
      email: 'autor@teste.com',
      telefone: '111',
      role: RoleUsuario.CLIENTE,
      senhaHash: 'hash-fake-1',
    });

    outroUsuario = await usuarioRepository.save({
      nome: 'Outro Usuario',
      email: 'outro@teste.com',
      telefone: '222',
      role: RoleUsuario.CLIENTE,
      senhaHash: 'hash-fake-2',
    });

    imovelAvaliado = await imovelRepository.save({
      titulo: 'Casa para Avaliar',
      cidade: 'Recife',
      tipo: TipoImovel.CASA,
      precoPorNoite: 200,
      capacidade: 2,
      proprietario: { id: outroUsuario.id },
      descricao: 'Casa de teste',
      endereco: 'Endereço de teste',
    });

    avaliacaoExistente = await avaliacaoRepository.save({
      autor: { id: usuarioAutor.id },
      imovel: { id: imovelAvaliado.id },
      nota: 4,
      comentario: 'Gostei, mas pode melhorar.',
    });

    tokenAutor = jwt.sign({ sub: usuarioAutor.id, role: usuarioAutor.role }, jwtSecret, {
      expiresIn: '1h',
    });
    tokenOutroUsuario = jwt.sign({ sub: outroUsuario.id, role: outroUsuario.role }, jwtSecret, {
      expiresIn: '1h',
    });
  });

  describe('GET /avaliacoes (Pública)', () => {
    it('deve retornar 200 e a lista de todas as avaliações', async () => {
      const res = await request(app).get('/avaliacoes');

      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(1);
      expect(res.body[0].id).toBe(avaliacaoExistente.id);
      expect(res.body[0].comentario).toBe(avaliacaoExistente.comentario);
    });
  });

  describe('GET /avaliacoes/imovel/:imovelId (Pública)', () => {
    it('deve retornar 200 e as avaliações do imóvel correto', async () => {
      const res = await request(app).get(`/avaliacoes/imovel/${imovelAvaliado.id}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].imovel.id).toBe(imovelAvaliado.id);
    });

    it('deve retornar 200 e lista vazia para imóvel sem avaliações', async () => {
      const res = await request(app).get('/avaliacoes/imovel/999');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(0);
    });
  });

  describe('GET /avaliacoes/usuario/:autorId (Pública)', () => {
    it('deve retornar 200 e as avaliações do autor correto', async () => {
      const res = await request(app).get(`/avaliacoes/usuario/${usuarioAutor.id}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].autor.id).toBe(usuarioAutor.id);
    });

    it('deve retornar 200 e lista vazia para usuário sem avaliações', async () => {
      const res = await request(app).get(`/avaliacoes/usuario/${outroUsuario.id}`);
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(0);
    });
  });

  describe('POST /avaliacoes (Autenticada)', () => {
    const dadosNovaAvaliacao = {
      autorId: 0,
      imovelId: 0,
      nota: 5,
      comentario: 'Avaliação nova!',
    };

    it('deve retornar 401 se não estiver autenticado', async () => {
      const dados = {
        ...dadosNovaAvaliacao,
        autorId: usuarioAutor.id,
        imovelId: imovelAvaliado.id,
      };
      const res = await request(app).post('/avaliacoes').send(dados);
      expect(res.status).toBe(401);
    });

    it('deve retornar 201 e criar a avaliação se autenticado', async () => {
      const dados = {
        ...dadosNovaAvaliacao,
        autorId: usuarioAutor.id,
        imovelId: imovelAvaliado.id,
      };

      const res = await request(app)
        .post('/avaliacoes')
        .set('Authorization', `Bearer ${tokenAutor}`)
        .send(dados);

      expect(res.status).toBe(201);
      expect(res.body.nota).toBe(5);
      expect(res.body.comentario).toBe(dados.comentario);

      const avaliacaoDoBanco = await avaliacaoRepository.findOneBy({ id: res.body.id });
      expect(avaliacaoDoBanco).toBeDefined();
    });

    it('deve retornar 400 se o autorId não existir', async () => {
      const dados = { ...dadosNovaAvaliacao, autorId: 999, imovelId: imovelAvaliado.id };

      const res = await request(app)
        .post('/avaliacoes')
        .set('Authorization', `Bearer ${tokenAutor}`)
        .send(dados);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Usuário (autor) não encontrado');
    });

    it('deve retornar 400 se o imovelId não existir', async () => {
      const dados = { ...dadosNovaAvaliacao, autorId: usuarioAutor.id, imovelId: 999 };

      const res = await request(app)
        .post('/avaliacoes')
        .set('Authorization', `Bearer ${tokenAutor}`)
        .send(dados);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Imóvel não encontrado');
    });

    it('TESTE DE SEGURANÇA: deve permitir criar avaliação para outro usuário', async () => {
      const dados = {
        ...dadosNovaAvaliacao,
        autorId: usuarioAutor.id,
        imovelId: imovelAvaliado.id,
      };

      const res = await request(app)
        .post('/avaliacoes')
        .set('Authorization', `Bearer ${tokenOutroUsuario}`)
        .send(dados);

      expect(res.status).toBe(201);
      expect(res.body.autor.id).toBe(usuarioAutor.id);
    });
  });

  describe('DELETE /avaliacoes/:id (Autenticada)', () => {
    it('deve retornar 401 se não estiver autenticado', async () => {
      const res = await request(app).delete(`/avaliacoes/${avaliacaoExistente.id}`);
      expect(res.status).toBe(401);
    });

    it('deve retornar 404 se a avaliação não existir', async () => {
      const res = await request(app)
        .delete('/avaliacoes/999')
        .set('Authorization', `Bearer ${tokenAutor}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Avaliação não encontrada');
    });

    it('TESTE DE SEGURANÇA: deve permitir outro usuário autenticado excluir a avaliação', async () => {
      const res = await request(app)
        .delete(`/avaliacoes/${avaliacaoExistente.id}`)
        .set('Authorization', `Bearer ${tokenOutroUsuario}`);

      expect(res.status).toBe(204);

      const avaliacaoDoBanco = await avaliacaoRepository.findOneBy({ id: avaliacaoExistente.id });
      expect(avaliacaoDoBanco).toBeNull();
    });

    it('deve retornar 204 e excluir a avaliação se for o autor', async () => {
      const res = await request(app)
        .delete(`/avaliacoes/${avaliacaoExistente.id}`)
        .set('Authorization', `Bearer ${tokenAutor}`);

      expect(res.status).toBe(204);

      const avaliacaoDoBanco = await avaliacaoRepository.findOneBy({ id: avaliacaoExistente.id });
      expect(avaliacaoDoBanco).toBeNull();
    });
  });
});
