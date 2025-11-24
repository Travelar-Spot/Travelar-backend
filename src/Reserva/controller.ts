import { Request, Response } from 'express';
import { ReservaService } from './service';
import { ReservaStatus } from './entity';

const reservaService = new ReservaService();

interface UsuarioAutenticado {
  id: number;
  role: string;
}

export const criarReserva = async (req: Request, res: Response) => {
  try {
    const usuario = req.user as UsuarioAutenticado;
    const novaReserva = await reservaService.criarReserva(req.body, usuario.id);
    return res.status(201).json(novaReserva);
  } catch (erro: any) {
    return res.status(400).json({ message: erro.message });
  }
};

export const listarReservas = async (_req: Request, res: Response) => {
  try {
    const listaReservas = await reservaService.listarReservas();
    return res.status(200).json(listaReservas);
  } catch (erro: any) {
    return res.status(500).json({ message: erro.message });
  }
};

export const listarMinhasReservasCliente = async (req: Request, res: Response) => {
  try {
    const usuario = req.user as UsuarioAutenticado;
    const reservasDoCliente = await reservaService.listarReservasPorCliente(usuario.id);
    return res.status(200).json(reservasDoCliente);
  } catch (erro: any) {
    return res.status(500).json({ message: erro.message });
  }
};

export const listarMinhasReservasProprietario = async (req: Request, res: Response) => {
  try {
    const usuario = req.user as UsuarioAutenticado;

    if (usuario.role !== 'PROPRIETARIO' && usuario.role !== 'AMBOS') {
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    const reservasDoProprietario = await reservaService.listarReservasPorProprietario(usuario.id);
    return res.status(200).json(reservasDoProprietario);
  } catch (erro: any) {
    return res.status(500).json({ message: erro.message });
  }
};

export const buscarReservaPorId = async (req: Request, res: Response) => {
  try {
    const idReserva = parseInt(req.params.id, 10);
    if (isNaN(idReserva)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    const reservaEncontrada = await reservaService.buscarReservaPorId(idReserva);
    if (!reservaEncontrada) {
      return res.status(404).json({ message: 'Reserva não encontrada' });
    }

    return res.status(200).json(reservaEncontrada);
  } catch (erro: any) {
    return res.status(500).json({ message: erro.message });
  }
};

export const modificarReserva = async (req: Request, res: Response) => {
  try {
    const usuario = req.user as UsuarioAutenticado;
    const idReserva = parseInt(req.params.id, 10);

    if (isNaN(idReserva)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    const reservaAtualizada = await reservaService.modificarReserva(
      idReserva,
      req.body,
      usuario.id,
    );
    return res.status(200).json(reservaAtualizada);
  } catch (erro: any) {
    if (erro.message.includes('não encontrada')) {
      return res.status(404).json({ message: erro.message });
    }
    if (erro.message.includes('Permissão negada')) {
      return res.status(403).json({ message: erro.message });
    }
    return res.status(400).json({ message: erro.message });
  }
};

export const excluirReserva = async (req: Request, res: Response) => {
  try {
    const usuario = req.user as UsuarioAutenticado;
    const idReserva = parseInt(req.params.id, 10);

    if (isNaN(idReserva)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    await reservaService.excluirOuCancelarReserva(idReserva, usuario.id);
    return res.status(204).send();
  } catch (erro: any) {
    if (erro.message.includes('não encontrada')) {
      return res.status(404).json({ message: erro.message });
    }
    if (erro.message.includes('Permissão negada')) {
      return res.status(403).json({ message: erro.message });
    }
    return res.status(400).json({ message: erro.message });
  }
};

export const atualizarStatusReserva = async (req: Request, res: Response) => {
  try {
    const usuario = req.user as UsuarioAutenticado;
    const idReserva = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (isNaN(idReserva)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    if (!status || !Object.values(ReservaStatus).includes(status as ReservaStatus)) {
      return res.status(400).json({ message: 'Status inválido fornecido.' });
    }

    const reservaAtualizada = await reservaService.atualizarStatusReserva(
      idReserva,
      status as ReservaStatus,
      usuario.id,
    );
    return res.status(200).json(reservaAtualizada);
  } catch (erro: any) {
    if (erro.message.includes('não encontrada')) {
      return res.status(404).json({ message: erro.message });
    }
    if (erro.message.includes('Permissão negada')) {
      return res.status(403).json({ message: erro.message });
    }
    return res.status(400).json({ message: erro.message });
  }
};
