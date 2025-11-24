import { Request, Response } from 'express';
import { ImovelService, ImovelFiltros } from './service';
import { TipoImovel } from './entity';

interface UsuarioAutenticado {
  id: number;
  role: string;
}

const imovelService = new ImovelService();

export const criarImovel = async (req: Request, res: Response) => {
  try {
    const usuario = req.user as UsuarioAutenticado;

    if (!usuario || !usuario.id) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    const novoImovel = await imovelService.criarImovel(req.body, usuario.id);
    return res.status(201).json(novoImovel);
  } catch (erro: any) {
    return res.status(400).json({ message: erro.message });
  }
};

export const listarImoveis = async (req: Request, res: Response) => {
  try {
    const { cidade, tipo, capacidade, minPreco, maxPreco } = req.query;
    const filtros: ImovelFiltros = {};

    if (cidade) {
      filtros.cidade = cidade as string;
    }

    if (tipo) {
      const listaTipos = Array.isArray(tipo) ? (tipo as string[]) : (tipo as string).split(',');
      const tiposValidos = listaTipos.filter((t) =>
        Object.values(TipoImovel).includes(t as TipoImovel),
      );
      if (tiposValidos.length > 0) {
        filtros.tipos = tiposValidos as TipoImovel[];
      }
    }

    if (capacidade) {
      const capacidadeNumerica = parseInt(capacidade as string, 10);
      if (isNaN(capacidadeNumerica)) {
        return res.status(400).json({ message: 'Capacidade inválida.' });
      }
      filtros.capacidade = capacidadeNumerica;
    }

    if (minPreco) {
      const precoMinimo = parseFloat(minPreco as string);
      if (isNaN(precoMinimo)) {
        return res.status(400).json({ message: 'Preço mínimo inválido.' });
      }
      filtros.minPreco = precoMinimo;
    }

    if (maxPreco) {
      const precoMaximo = parseFloat(maxPreco as string);
      if (isNaN(precoMaximo)) {
        return res.status(400).json({ message: 'Preço máximo inválido.' });
      }
      filtros.maxPreco = precoMaximo;
    }

    const imoveis = await imovelService.listarImoveis(filtros);
    return res.status(200).json(imoveis);
  } catch (erro: any) {
    return res.status(500).json({ message: 'Erro interno ao buscar imóveis.' });
  }
};

export const buscarImovelPorId = async (req: Request, res: Response) => {
  try {
    const idImovel = parseInt(req.params.id, 10);
    if (isNaN(idImovel)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    const imovel = await imovelService.buscarImovelPorId(idImovel);
    if (!imovel) {
      return res.status(404).json({ message: 'Imóvel não encontrado' });
    }
    return res.status(200).json(imovel);
  } catch (erro: any) {
    return res.status(500).json({ message: 'Erro interno ao buscar imóvel.' });
  }
};

export const atualizarImovel = async (req: Request, res: Response) => {
  try {
    const idImovel = parseInt(req.params.id, 10);
    if (isNaN(idImovel)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    const usuario = req.user as UsuarioAutenticado;
    if (!usuario || !usuario.id) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    const imovelAtualizado = await imovelService.atualizarImovel(idImovel, req.body, usuario.id);
    return res.status(200).json(imovelAtualizado);
  } catch (erro: any) {
    if (erro.message.includes('não encontrado')) {
      return res.status(404).json({ message: erro.message });
    }
    if (erro.message.includes('Permissão negada')) {
      return res.status(403).json({ message: erro.message });
    }
    return res.status(400).json({ message: erro.message });
  }
};

export const excluirImovel = async (req: Request, res: Response) => {
  try {
    const idImovel = parseInt(req.params.id, 10);
    if (isNaN(idImovel)) {
      return res.status(400).json({ message: 'ID do imóvel inválido' });
    }

    const usuario = req.user as UsuarioAutenticado;
    if (!usuario || !usuario.id) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    await imovelService.excluirImovel(idImovel, usuario.id);
    return res.status(204).send();
  } catch (erro: any) {
    if (erro.message.includes('não encontrado')) {
      return res.status(404).json({ message: erro.message });
    }
    if (erro.message.includes('Permissão negada')) {
      return res.status(403).json({ message: erro.message });
    }
    return res.status(500).json({ message: 'Erro interno ao tentar excluir o imóvel.' });
  }
};
