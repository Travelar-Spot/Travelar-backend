import { Request, Response } from 'express';
import { UsuarioService } from './service';

interface UsuarioAutenticado {
  id: number;
  email: string;
}

const usuarioService = new UsuarioService();

export const listarUsuarios = async (_req: Request, res: Response) => {
  try {
    const listaUsuarios = await usuarioService.listarUsuarios();
    return res.status(200).json(listaUsuarios);
  } catch (erro: any) {
    return res.status(500).json({ message: erro.message });
  }
};

export const buscarUsuarioPorId = async (req: Request, res: Response) => {
  try {
    const idUsuario = parseInt(req.params.id, 10);
    if (isNaN(idUsuario)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    const usuarioEncontrado = await usuarioService.buscarUsuarioPorId(idUsuario);
    if (!usuarioEncontrado) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const { senhaHash, ...dadosUsuario } = usuarioEncontrado as any;
    return res.status(200).json(dadosUsuario);
  } catch (erro: any) {
    return res.status(400).json({ message: erro.message });
  }
};

export const atualizarUsuario = async (req: Request, res: Response) => {
  try {
    const idParaAtualizar = parseInt(req.params.id, 10);
    if (isNaN(idParaAtualizar)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    const usuarioAutenticado = req.user as UsuarioAutenticado;
    if (!usuarioAutenticado || !usuarioAutenticado.id) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    if (usuarioAutenticado.id !== idParaAtualizar) {
      return res
        .status(403)
        .json({ message: 'Permissão negada: Você só pode editar seu próprio perfil.' });
    }

    const { nome, telefone, foto } = req.body;
    const dadosParaAtualizar = { nome, telefone, foto };

    const usuarioAtualizado = await usuarioService.atualizarUsuario(
      idParaAtualizar,
      dadosParaAtualizar,
    );

    const { senhaHash, ...dadosUsuario } = usuarioAtualizado as any;
    return res.status(200).json(dadosUsuario);
  } catch (erro: any) {
    if (erro.message.includes('não encontrado')) {
      return res.status(404).json({ message: erro.message });
    }
    return res.status(400).json({ message: erro.message });
  }
};

export const excluirUsuario = async (req: Request, res: Response) => {
  try {
    const idParaExcluir = parseInt(req.params.id, 10);
    if (isNaN(idParaExcluir)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    const usuarioAutenticado = req.user as UsuarioAutenticado;
    if (!usuarioAutenticado || !usuarioAutenticado.id) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    if (usuarioAutenticado.id !== idParaExcluir) {
      return res
        .status(403)
        .json({ message: 'Permissão negada: Você só pode excluir sua própria conta.' });
    }

    await usuarioService.excluirUsuario(idParaExcluir);

    return res.status(204).send();
  } catch (erro: any) {
    if (erro.message.includes('não encontrado')) {
      return res.status(404).json({ message: erro.message });
    }
    if (erro.message.includes('não é possível excluir') || erro.message.includes('possui')) {
      return res.status(409).json({ message: erro.message });
    }
    return res.status(400).json({ message: erro.message });
  }
};
