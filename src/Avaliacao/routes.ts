import { Router } from 'express';
import * as avaliacaoController from './controller';
import passport from '../config/passport.config';

const router = Router();

/**
 * @swagger
 * tags:
 * name: Avaliações
 * description: Operações relacionadas a avaliações de hospedagens
 */

/**
 * @swagger
 * components:
 * schemas:
 * AvaliacaoInput:
 * type: object
 * required:
 * - autorId
 * - imovelId
 * - nota
 * properties:
 * autorId:
 * type: integer
 * description: ID do usuário que realizou a avaliação
 * imovelId:
 * type: integer
 * description: ID do imóvel avaliado
 * nota:
 * type: integer
 * minimum: 0
 * maximum: 5
 * description: Nota atribuída à hospedagem
 * comentario:
 * type: string
 * description: Comentário opcional do cliente
 * example:
 * autorId: 1
 * imovelId: 15
 * nota: 4
 * comentario: "Imóvel muito limpo e anfitrião atencioso."
 */

/**
 * @swagger
 * /avaliacoes:
 * post:
 * summary: Criar uma nova avaliação (Requer Autenticação)
 * tags: [Avaliações]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/AvaliacaoInput'
 * responses:
 * '201':
 * description: Avaliação criada com sucesso
 * '400':
 * description: Dados inválidos
 * '401':
 * description: Não autorizado
 */
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  avaliacaoController.criarAvaliacao,
);

/**
 * @swagger
 * /avaliacoes:
 * get:
 * summary: Listar todas as avaliações
 * tags: [Avaliações]
 * responses:
 * '200':
 * description: Lista de todas as avaliações cadastradas
 */
router.get('/', avaliacaoController.listarAvaliacoes);

/**
 * @swagger
 * /avaliacoes/imovel/{imovelId}:
 * get:
 * summary: Listar avaliações de um imóvel específico
 * tags: [Avaliações]
 * parameters:
 * - in: path
 * name: imovelId
 * schema:
 * type: integer
 * required: true
 * description: ID do imóvel
 * responses:
 * '200':
 * description: Lista de avaliações do imóvel
 * '404':
 * description: Imóvel não encontrado
 */
router.get('/imovel/:imovelId', avaliacaoController.listarAvaliacoesPorImovel);

/**
 * @swagger
 * /avaliacoes/usuario/{autorId}:
 * get:
 * summary: Listar avaliações feitas por um usuário específico
 * tags: [Avaliações]
 * parameters:
 * - in: path
 * name: autorId
 * schema:
 * type: integer
 * required: true
 * description: ID do usuário autor das avaliações
 * responses:
 * '200':
 * description: Lista de avaliações do usuário
 * '404':
 * description: Usuário não encontrado
 */
router.get('/usuario/:autorId', avaliacaoController.listarAvaliacoesPorUsuario);

/**
 * @swagger
 * /avaliacoes/{id}:
 * delete:
 * summary: Excluir uma avaliação existente (Requer Autenticação)
 * tags: [Avaliações]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: integer
 * required: true
 * description: ID da avaliação
 * responses:
 * '204':
 * description: Avaliação excluída com sucesso
 * '401':
 * description: Não autorizado
 * '404':
 * description: Avaliação não encontrada
 */
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  avaliacaoController.excluirAvaliacao,
);

export default router;
