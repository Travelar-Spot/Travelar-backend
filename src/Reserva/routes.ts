import { Router } from 'express';
import * as controller from './controller';
import passport from '../config/passport.config';

const router = Router();

router.use(passport.authenticate('jwt', { session: false }));

/**
 * @swagger
 * tags:
 * name: Reservas
 * description: Criação e controle de reservas de hospedagem
 */

/**
 * @swagger
 * components:
 * schemas:
 * ReservaInput:
 * type: object
 * required:
 * - clienteId
 * - imovelId
 * - dataInicio
 * - dataFim
 * properties:
 * clienteId:
 * type: integer
 * imovelId:
 * type: integer
 * dataInicio:
 * type: string
 * format: date
 * dataFim:
 * type: string
 * format: date
 * example:
 * clienteId: 1
 * imovelId: 10
 * dataInicio: "2025-12-10"
 * dataFim: "2025-12-15"
 * ReservaUpdateInput:
 * type: object
 * required:
 * - dataInicio
 * - dataFim
 * properties:
 * dataInicio:
 * type: string
 * format: date
 * dataFim:
 * type: string
 * format: date
 * example:
 * dataInicio: "2025-12-12"
 * dataFim: "2025-12-17"
 */

/**
 * @swagger
 * /reservas:
 * post:
 * summary: Criar uma nova reserva (Requer Autenticação)
 * tags: [Reservas]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ReservaInput'
 * responses:
 * '201':
 * description: Reserva criada com sucesso
 * '400':
 * description: Dados inválidos
 * '401':
 * description: Não autorizado
 */
router.post('/', controller.criarReserva);

/**
 * @swagger
 * /reservas:
 * get:
 * summary: Listar todas as reservas (Requer Autenticação)
 * tags: [Reservas]
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: Lista de reservas retornada com sucesso
 * '401':
 * description: Não autorizado
 */
router.get('/', controller.listarReservas);

/**
 * @swagger
 * /reservas/{id}:
 * get:
 * summary: Buscar reserva por ID (Requer Autenticação)
 * tags: [Reservas]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: integer
 * required: true
 * responses:
 * '200':
 * description: Reserva encontrada
 * '401':
 * description: Não autorizado
 * '404':
 * description: Reserva não encontrada
 */
router.get('/:id', controller.buscarReservaPorId);

/**
 * @swagger
 * /reservas/{id}:
 * put:
 * summary: Modificar as datas de uma reserva (Requer Autenticação)
 * tags: [Reservas]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: integer
 * required: true
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ReservaUpdateInput'
 * responses:
 * '200':
 * description: Reserva modificada com sucesso
 * '400':
 * description: Dados inválidos
 * '401':
 * description: Não autorizado
 * '404':
 * description: Reserva não encontrada
 */
router.put('/:id', controller.modificarReserva);

/**
 * @swagger
 * /reservas/{id}:
 * delete:
 * summary: Excluir uma reserva (Requer Autenticação)
 * tags: [Reservas]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: integer
 * required: true
 * responses:
 * '204':
 * description: Reserva removida com sucesso
 * '401':
 * description: Não autorizado
 * '404':
 * description: Reserva não encontrada
 */
router.delete('/:id', controller.excluirReserva);

/**
 * @swagger
 * /reservas/cliente/me:
 * get:
 * summary: Listar minhas reservas como cliente (Requer Autenticação)
 * tags: [Reservas]
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: Lista de reservas do cliente
 * '401':
 * description: Não autorizado
 */
router.get('/cliente/me', controller.listarMinhasReservasCliente);

/**
 * @swagger
 * /reservas/proprietario/me:
 * get:
 * summary: Listar minhas reservas como proprietário (Requer Autenticação)
 * tags: [Reservas]
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: Lista de reservas do proprietário
 * '401':
 * description: Não autorizado
 */
router.get('/proprietario/me', controller.listarMinhasReservasProprietario);

/**
 * @swagger
 * /reservas/{id}/status:
 * patch:
 * summary: Atualizar status de uma reserva (Requer Autenticação)
 * tags: [Reservas]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: integer
 * required: true
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * status:
 * type: string
 * enum: [PENDENTE, CONFIRMADA, CANCELADA, FINALIZADA]
 * responses:
 * '200':
 * description: Status da reserva atualizado
 * '401':
 * description: Não autorizado
 * '404':
 * description: Reserva não encontrada
 */
router.patch('/:id/status', controller.atualizarStatusReserva);

export default router;
