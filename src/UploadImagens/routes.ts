import { Router, Request, Response } from 'express';
import { uploadMiddleware } from '../config/cloudinary';
import passport from '../config/passport.config';

const router = Router();

/**
 * @swagger
 * /upload:
 * post:
 * summary: Fazer upload de uma imagem
 * description: Envia uma imagem para o Cloudinary e retorna a URL pública. Requer autenticação.
 * tags: [Upload]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * multipart/form-data:
 * schema:
 * type: object
 * properties:
 * file:
 * type: string
 * format: binary
 * description: O arquivo de imagem a ser enviado (JPG, PNG, WEBP)
 * responses:
 * 200:
 * description: Upload realizado com sucesso
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * url:
 * type: string
 * description: URL pública da imagem no Cloudinary
 * example: "https://res.cloudinary.com/demo/image/upload/v123456789/exemplo.jpg"
 * 400:
 * description: Nenhum arquivo enviado ou formato inválido
 * 401:
 * description: Não autorizado (Token ausente ou inválido)
 * 500:
 * description: Erro no servidor ao processar o upload
 */
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  uploadMiddleware.single('file'),
  (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
    }

    return res.status(200).json({ url: (req.file as any).path });
  },
);

export default router;
