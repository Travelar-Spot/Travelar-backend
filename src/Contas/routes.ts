import { Router } from 'express';
import * as Controlador from './controller';

const rotas = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ContaUsuario:
 *       type: object
 *       required:
 *         - nome
 *         - cpf
 *         - dataNascimento
 *         - telefone
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Identificador único da conta
 *           readOnly: true
 *         nome:
 *           type: string
 *           description: Nome completo do titular da conta
 *         cpf:
 *           type: string
 *           description: CPF do titular (deve ser único)
 *         dataNascimento:
 *           type: string
 *           format: date
 *           description: Data de nascimento (AAAA-MM-DD)
 *         telefone:
 *           type: string
 *           description: Número de telefone para contato
 */

/**
 * @swagger
 * /api/contas:
 *   post:
 *     summary: Criar nova conta de usuário
 *     tags:
 *       - Contas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContaUsuario'
 *     responses:
 *       '201':
 *         description: Conta criada com sucesso
 *       '409':
 *         description: CPF já cadastrado
 *   get:
 *     summary: Listar todas as contas
 *     tags:
 *       - Contas
 *     responses:
 *       '200':
 *         description: Lista de contas recuperada com sucesso
 */
rotas.post('/', Controlador.criar);
rotas.get('/', Controlador.listarTodos);

/**
 * @swagger
 * /api/contas/{id}:
 *   get:
 *     summary: Buscar conta por ID
 *     tags:
 *       - Contas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador único da conta
 *     responses:
 *       '200':
 *         description: Conta encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContaUsuario'
 *       '404':
 *         description: Conta não encontrada
 *   put:
 *     summary: Atualizar dados da conta
 *     tags:
 *       - Contas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador da conta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContaUsuario'
 *     responses:
 *       '200':
 *         description: Conta atualizada com sucesso
 *       '404':
 *         description: Conta não encontrada
 *   delete:
 *     summary: Remover conta
 *     tags:
 *       - Contas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador da conta
 *     responses:
 *       '204':
 *         description: Conta removida com sucesso
 *       '404':
 *         description: Conta não encontrada
 */
rotas.get('/:id', Controlador.buscarPorId);
rotas.put('/:id', Controlador.atualizar);
rotas.delete('/:id', Controlador.excluir);

export default rotas;
