import { Request, Response } from 'express';
import { AvaliacaoService } from './service';

const avaliacaoService = new AvaliacaoService();

export const criarAvaliacao = async (req: Request, res: Response) => {
  try {
    const novaAvaliacao = await avaliacaoService.criarAvaliacao(req.body);
    return res.status(201).json(novaAvaliacao);
  } catch (erro: any) {
    return res.status(400).json({ message: erro.message });
  }
};

export const listarAvaliacoes = async (_req: Request, res: Response) => {
  try {
    const listaDeAvaliacoes = await avaliacaoService.listarTodasAvaliacoes();
    return res.status(200).json(listaDeAvaliacoes);
  } catch (erro: any) {
    return res.status(500).json({ message: erro.message });
  }
};

export const listarAvaliacoesPorImovel = async (req: Request, res: Response) => {
  try {
    const imovelId = Number(req.params.imovelId);
    const avaliacoesDoImovel = await avaliacaoService.listarAvaliacoesPorImovel(imovelId);
    return res.status(200).json(avaliacoesDoImovel);
  } catch (erro: any) {
    return res.status(400).json({ message: erro.message });
  }
};

export const listarAvaliacoesPorUsuario = async (req: Request, res: Response) => {
  try {
    const usuarioId = Number(req.params.autorId);
    const avaliacoesDoUsuario = await avaliacaoService.listarAvaliacoesPorUsuario(usuarioId);
    return res.status(200).json(avaliacoesDoUsuario);
  } catch (erro: any) {
    return res.status(400).json({ message: erro.message });
  }
};

export const excluirAvaliacao = async (req: Request, res: Response) => {
  try {
    const avaliacaoId = Number(req.params.id);
    await avaliacaoService.excluirAvaliacao(avaliacaoId);
    return res.status(204).send();
  } catch (erro: any) {
    if (erro.message.includes('não encontrada')) {
      return res.status(404).json({ message: erro.message });
    }
    return res.status(400).json({ message: erro.message });
  }
};
