import { Request, Response } from 'express';
import * as ServicoContas from './service';

export const criar = async (req: Request, res: Response) => {
  try {
    const novaConta = await ServicoContas.criarConta(req.body);
    return res.status(201).json(novaConta);
  } catch (erro) {
    return res.status(409).json({ mensagem: (erro as Error).message });
  }
};

export const listarTodos = async (_req: Request, res: Response) => {
  const contas = await ServicoContas.listarContas();
  return res.status(200).json(contas);
};

export const buscarPorId = async (req: Request, res: Response) => {
  const conta = await ServicoContas.buscarContaPorId(req.params.id);

  if (!conta) {
    return res.status(404).json({ mensagem: 'Conta não encontrada.' });
  }

  return res.status(200).json(conta);
};

export const atualizar = async (req: Request, res: Response) => {
  try {
    const contaAtualizada = await ServicoContas.atualizarConta(req.params.id, req.body);
    return res.status(200).json(contaAtualizada);
  } catch (erro) {
    return res.status(404).json({ mensagem: (erro as Error).message });
  }
};

export const excluir = async (req: Request, res: Response) => {
  try {
    await ServicoContas.excluirConta(req.params.id);
    return res.status(204).send();
  } catch (erro) {
    return res.status(404).json({ mensagem: (erro as Error).message });
  }
};
