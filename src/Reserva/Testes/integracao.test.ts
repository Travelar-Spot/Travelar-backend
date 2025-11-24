import request from 'supertest';
import app from '../../app';
import { AppDataSource } from '../../database/data-source';
import { Usuario, RoleUsuario } from '../../Usuario/entity';
import { Imovel, TipoImovel } from '../../Imovel/entity';
import { Reserva, ReservaStatus } from '../entity';
import jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';

describe('Reserva API (Testes de Integração)', () => {
  let usuarioRepository: Repository<Usuario>;
  let imovelRepository: Repository<Imovel>;
  let reservaRepository: Repository<Reserva>;

  let usuarioCliente: Usuario;
  let usuarioProprietario: Usuario;
  let tokenCliente: string;
  let tokenProprietario: string;

  let imovelDisponivel: Imovel;
  let imovelIndisponivel: Imovel;

  let reservaPendente: Reserva;

  const jwtSecret = process.env.JWT_SECRET!;

  beforeAll(async () => {
    await AppDataSource.initialize();
    usuarioRepository = AppDataSource.getRepository(Usuario);
    imovelRepository = AppDataSource.getRepository(Imovel);
    reservaRepository = AppDataSource.getRepository(Reserva);
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  beforeEach(async () => {
    await usuarioRepository.query('TRUNCATE TABLE usuarios RESTART IDENTITY CASCADE');

    usuarioCliente = await usuarioRepository.save({
      nome: 'Cliente Reserva',
      email: 'cliente@reserva.com',
      telefone: '111',
      role: RoleUsuario.CLIENTE,
      senhaHash: 'hash-fake-cliente',
    });

    usuarioProprietario = await usuarioRepository.save({
      nome: 'Proprietário Reserva',
      email: 'prop@reserva.com',
      telefone: '222',
      role: RoleUsuario.PROPRIETARIO,
      senhaHash: 'hash-fake-prop',
    });

    imovelDisponivel = await imovelRepository.save({
      titulo: 'Casa Disponível',
      cidade: 'Teste',
      tipo: TipoImovel.CASA,
      precoPorNoite: 100,
      capacidade: 4,
      disponivel: true,
      proprietario: { id: usuarioProprietario.id },
      descricao: 'Desc',
      endereco: 'End',
    });

    imovelIndisponivel = await imovelRepository.save({
      titulo: 'Casa Indisponível',
      cidade: 'Teste',
      tipo: TipoImovel.CASA,
      precoPorNoite: 200,
      capacidade: 2,
      disponivel: false,
      proprietario: { id: usuarioProprietario.id },
      descricao: 'Desc 2',
      endereco: 'End 2',
    });

    reservaPendente = await reservaRepository.save({
      cliente: { id: usuarioCliente.id },
      imovel: { id: imovelDisponivel.id },
      dataInicio: '2026-01-05',
      dataFim: '2026-01-10',
      valorTotal: 500,
      status: ReservaStatus.PENDENTE,
    });

    tokenCliente = jwt.sign(
      { sub: usuarioCliente.id, email: usuarioCliente.email, role: usuarioCliente.role },
      jwtSecret,
      { expiresIn: '1h' },
    );
    tokenProprietario = jwt.sign(
      {
        sub: usuarioProprietario.id,
        email: usuarioProprietario.email,
        role: usuarioProprietario.role,
      },
      jwtSecret,
      { expiresIn: '1h' },
    );
  });

  describe('POST /reservas', () => {
    const dadosNovaReserva = {
      imovelId: 0,
      dataInicio: '2026-02-01',
      dataFim: '2026-02-05',
    };

    it('deve retornar 401 se não estiver autenticado', async () => {
      const res = await request(app).post('/reservas').send(dadosNovaReserva);
      expect(res.status).toBe(401);
    });

    it('deve retornar 400 se o imóvel não estiver disponível', async () => {
      const dados = { ...dadosNovaReserva, imovelId: imovelIndisponivel.id };
      const res = await request(app)
        .post('/reservas')
        .set('Authorization', `Bearer ${tokenCliente}`)
        .send(dados);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Imóvel não está disponível para reserva');
    });
  });

  describe('GET /reservas/cliente/me', () => {
    it('deve retornar 200 e as reservas do cliente logado', async () => {
      const res = await request(app)
        .get('/reservas/cliente/me')
        .set('Authorization', `Bearer ${tokenCliente}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].id).toBe(reservaPendente.id);
    });

    it('deve retornar 200 e lista vazia para proprietário sem reservas', async () => {
      const res = await request(app)
        .get('/reservas/cliente/me')
        .set('Authorization', `Bearer ${tokenProprietario}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(0);
    });
  });

  describe('GET /reservas/proprietario/me', () => {
    it('deve retornar 200 e as reservas dos imóveis do proprietário', async () => {
      const res = await request(app)
        .get('/reservas/proprietario/me')
        .set('Authorization', `Bearer ${tokenProprietario}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].id).toBe(reservaPendente.id);
      expect(res.body[0].cliente).toBeDefined();
    });

    it('deve retornar 403 se o usuário for apenas CLIENTE', async () => {
      const res = await request(app)
        .get('/reservas/proprietario/me')
        .set('Authorization', `Bearer ${tokenCliente}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Acesso negado.');
    });
  });

  describe('DELETE /reservas/:id (Cancelar como Cliente)', () => {
    it('deve retornar 204 e cancelar a reserva se for o cliente', async () => {
      const res = await request(app)
        .delete(`/reservas/${reservaPendente.id}`)
        .set('Authorization', `Bearer ${tokenCliente}`);

      expect(res.status).toBe(204);

      const reservaCancelada = await reservaRepository.findOneBy({ id: reservaPendente.id });
      expect(reservaCancelada?.status).toBe(ReservaStatus.CANCELADA_CLIENTE);
    });

    it('deve retornar 403 se o usuário não for o cliente da reserva', async () => {
      const res = await request(app)
        .delete(`/reservas/${reservaPendente.id}`)
        .set('Authorization', `Bearer ${tokenProprietario}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Permissão negada para modificar esta reserva');
    });
  });

  describe('PATCH /reservas/:id/status (Gerenciar como Proprietário)', () => {
    it('deve retornar 200 e CONFIRMAR a reserva se for o proprietário', async () => {
      const res = await request(app)
        .patch(`/reservas/${reservaPendente.id}/status`)
        .set('Authorization', `Bearer ${tokenProprietario}`)
        .send({ status: ReservaStatus.CONFIRMADA });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(ReservaStatus.CONFIRMADA);
    });

    it('deve retornar 200 e RECUSAR a reserva se for o proprietário', async () => {
      const res = await request(app)
        .patch(`/reservas/${reservaPendente.id}/status`)
        .set('Authorization', `Bearer ${tokenProprietario}`)
        .send({ status: ReservaStatus.CANCELADA_PROPRIETARIO });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(ReservaStatus.CANCELADA_PROPRIETARIO);
    });

    it('deve retornar 403 se o usuário for o cliente', async () => {
      const res = await request(app)
        .patch(`/reservas/${reservaPendente.id}/status`)
        .set('Authorization', `Bearer ${tokenCliente}`)
        .send({ status: ReservaStatus.CONFIRMADA });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Permissão negada: você não é o proprietário');
    });

    it('deve retornar 400 para um status inválido', async () => {
      const res = await request(app)
        .patch(`/reservas/${reservaPendente.id}/status`)
        .set('Authorization', `Bearer ${tokenProprietario}`)
        .send({ status: 'STATUS_INVALIDO' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Status inválido fornecido.');
    });
  });
});
