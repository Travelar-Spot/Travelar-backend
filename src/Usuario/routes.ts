import { Router } from 'express';
import * as controller from './controller';
import passport from '../config/passport.config';

const router = Router();

/**
 * @swagger
 * tags:
 * name: Usuários
 * description: Gerenciamento de usuários (Leitura, Atualização e Exclusão)
 */

/**
 * @swagger
 * components:
 * schemas:
 * UsuarioUpdateInput:
 * type: object
 * properties:
 * nome:
 * type: string
 * telefone:
 * type: string
 * example:
 * nome: "João Silva"
 * telefone: "(11) 99999-9999"
 */

/**
 * @swagger
 * /usuarios:
 * get:
 * summary: Listar todos os usuários
 * tags: [Usuários]
 * responses:
 * '200':
 * description: Lista de usuários retornada com sucesso
 * '500':
 * description: Erro interno do servidor
 */
router.get('/', controller.listarUsuarios);

/**
 * @swagger
 * /usuarios/{id}:
 * get:
 * summary: Buscar usuário por ID
 * tags: [Usuários]
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: integer
 * required: true
 * description: ID do usuário
 * responses:
 * '200':
 * description: Usuário encontrado
 * '404':
 * description: Usuário não encontrado
 */
router.get('/:id', controller.buscarUsuarioPorId);

/**
 * @swagger
 * /usuarios/{id}:
 * put:
 * summary: Atualizar dados do usuário (nome, telefone) - Requer Autenticação
 * tags: [Usuários]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: integer
 * required: true
 * description: ID do usuário a ser atualizado
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/UsuarioUpdateInput'
 * responses:
 * '200':
 * description: Usuário atualizado
 * '401':
 * description: Não autorizado
 * '403':
 * description: Permissão negada (tentando editar outro usuário)
 * '404':
 * description: Usuário não encontrado
 */
router.put('/:id', passport.authenticate('jwt', { session: false }), controller.atualizarUsuario);

/**
 * @swagger
 * /usuarios/{id}:
 * delete:
 * summary: Excluir conta do usuário - Requer Autenticação
 * tags: [Usuários]
 * description: Exclui a conta do usuário. O usuário só pode excluir a própria conta. Não é possível excluir se houver imóveis ou reservas associadas.
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: integer
 * required: true
 * description: ID do usuário a ser excluído
 * responses:
 * '204':
 * description: Usuário excluído com sucesso (Sem conteúdo)
 * '401':
 * description: Não autorizado
 * '403':
 * description: Permissão negada (tentando excluir outro usuário)
 * '404':
 * description: Usuário não encontrado
 * '409':
 * description: Conflito - Não é possível excluir usuário com imóveis ou reservas vinculadas
 */
router.delete('/:id', passport.authenticate('jwt', { session: false }), controller.excluirUsuario);

export default router;
