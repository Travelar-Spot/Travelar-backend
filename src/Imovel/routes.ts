import { Router } from 'express';
import * as imovelController from './controller';
import passport from '../config/passport.config';

const router = Router();

/**
 * @swagger
 * tags:
 * name: Imóveis
 * description: Operações relacionadas aos imóveis disponíveis para aluguel
 */

/**
 * @swagger
 * components:
 * schemas:
 * ImovelInput:
 * type: object
 * required:
 * - titulo
 * - descricao
 * - tipo
 * - endereco
 * - cidade
 * - precoPorNoite
 * - capacidade
 * properties:
 * titulo:
 * type: string
 * descricao:
 * type: string
 * tipo:
 * type: string
 * enum: [CASA, APARTAMENTO]
 * endereco:
 * type: string
 * cidade:
 * type: string
 * precoPorNoite:
 * type: number
 * format: float
 * capacidade:
 * type: integer
 * disponivel:
 * type: boolean
 * default: true
 */

/**
 * @swagger
 * /imoveis:
 * post:
 * summary: Cadastrar um novo imóvel (Requer Autenticação)
 * tags: [Imóveis]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ImovelInput'
 * responses:
 * '201':
 * description: Imóvel cadastrado
 * '401':
 * description: Não autorizado
 */
router.post('/', passport.authenticate('jwt', { session: false }), imovelController.criarImovel);

/**
 * @swagger
 * /imoveis:
 * get:
 * summary: Listar imóveis com filtros opcionais
 * tags: [Imóveis]
 * parameters:
 * - in: query
 * name: tipo
 * schema:
 * type: string
 * enum: [CASA, APARTAMENTO]
 * description: Filtra por tipo de imóvel
 * - in: query
 * name: cidade
 * schema:
 * type: string
 * description: Filtra por cidade (correspondência exata)
 * - in: query
 * name: capacidade
 * schema:
 * type: integer
 * description: Filtra por capacidade mínima de hóspedes
 * - in: query
 * name: minPreco
 * schema:
 * type: number
 * description: Preço mínimo da diária
 * - in: query
 * name: maxPreco
 * schema:
 * type: number
 * description: Preço máximo da diária
 * responses:
 * '200':
 * description: Lista de imóveis
 */
router.get('/', imovelController.listarImoveis);

/**
 * @swagger
 * /imoveis/{id}:
 * get:
 * summary: Obter detalhes de um imóvel
 * tags: [Imóveis]
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: integer
 * required: true
 * description: ID do imóvel
 * responses:
 * '200':
 * description: Imóvel encontrado
 * '404':
 * description: Imóvel não encontrado
 */
router.get('/:id', imovelController.buscarImovelPorId);

/**
 * @swagger
 * /imoveis/{id}:
 * put:
 * summary: Atualizar dados de um imóvel (Requer Autenticação)
 * tags: [Imóveis]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: integer
 * required: true
 * description: ID do imóvel
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ImovelInput'
 * responses:
 * '200':
 * description: Imóvel atualizado
 * '401':
 * description: Não autorizado
 * '404':
 * description: Imóvel não encontrado
 */
router.put(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  imovelController.atualizarImovel,
);

/**
 * @swagger
 * /imoveis/{id}:
 * delete:
 * summary: Excluir um imóvel (Requer Autenticação)
 * tags: [Imóveis]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: integer
 * required: true
 * description: ID do imóvel
 * responses:
 * '204':
 * description: Imóvel excluído
 * '401':
 * description: Não autorizado
 * '404':
 * description: Imóvel não encontrado
 */
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  imovelController.excluirImovel,
);

export default router;
