import { Repository, MoreThanOrEqual, LessThanOrEqual, Between, In } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { Imovel, TipoImovel } from './entity';
import { Usuario } from '../Usuario/entity';
import { UsuarioService } from '../Usuario/service';

export interface ImovelFiltros {
  cidade?: string;
  tipos?: TipoImovel[];
  capacidade?: number;
  minPreco?: number;
  maxPreco?: number;
}

export class ImovelService {
  constructor(
    private readonly imovelRepository: Repository<Imovel> = AppDataSource.getRepository(Imovel),
    private readonly usuarioRepository: Repository<Usuario> = AppDataSource.getRepository(Usuario),
    private readonly usuarioService: UsuarioService = new UsuarioService(),
  ) {}

  async criarImovel(dadosImovel: Partial<Imovel>, idProprietario: number): Promise<Imovel> {
    if (!idProprietario) {
      throw new Error('ID do proprietário inválido ou ausente.');
    }

    const novoImovel = this.imovelRepository.create({
      ...dadosImovel,
      proprietario: { id: idProprietario },
    });

    const imovelSalvo = await this.imovelRepository.save(novoImovel);

    try {
      await this.usuarioService.atualizarRoleDinamicamente(idProprietario);
    } catch (erro) {
      console.warn('Aviso: Falha ao atualizar role do usuário.', erro);
    }

    return imovelSalvo;
  }

  async listarImoveis(filtros: ImovelFiltros): Promise<Imovel[]> {
    const condicoesBusca: any = {};

    if (filtros.cidade) {
      condicoesBusca.cidade = filtros.cidade;
    }

    if (filtros.tipos && filtros.tipos.length > 0) {
      condicoesBusca.tipo = In(filtros.tipos);
    }

    if (filtros.capacidade) {
      condicoesBusca.capacidade = MoreThanOrEqual(filtros.capacidade);
    }

    if (filtros.minPreco && filtros.maxPreco) {
      condicoesBusca.precoPorNoite = Between(filtros.minPreco, filtros.maxPreco);
    } else if (filtros.minPreco) {
      condicoesBusca.precoPorNoite = MoreThanOrEqual(filtros.minPreco);
    } else if (filtros.maxPreco) {
      condicoesBusca.precoPorNoite = LessThanOrEqual(filtros.maxPreco);
    }

    return this.imovelRepository.find({
      where: condicoesBusca,
      relations: ['proprietario', 'reservas', 'avaliacoes'],
    });
  }

  async buscarImovelPorId(id: number): Promise<Imovel | null> {
    return this.imovelRepository.findOne({
      where: { id },
      relations: ['proprietario', 'reservas', 'avaliacoes', 'reservas.cliente', 'avaliacoes.autor'],
    });
  }

  async atualizarImovel(
    idImovel: number,
    dadosAtualizacao: Partial<Imovel>,
    idUsuarioSolicitante: number,
  ): Promise<Imovel> {
    const imovelExistente = await this.buscarImovelPorId(idImovel);

    if (!imovelExistente) {
      throw new Error('Imóvel não encontrado');
    }

    if (imovelExistente.proprietario.id !== idUsuarioSolicitante) {
      throw new Error('Permissão negada: Você não é o proprietário deste imóvel.');
    }

    Object.assign(imovelExistente, dadosAtualizacao);
    const imovelAtualizado = await this.imovelRepository.save(imovelExistente);

    await this.usuarioService.atualizarRoleDinamicamente(idUsuarioSolicitante);

    return imovelAtualizado;
  }

  async excluirImovel(idImovel: number, idUsuarioSolicitante: number): Promise<void> {
    const imovelExistente = await this.buscarImovelPorId(idImovel);

    if (!imovelExistente) {
      throw new Error('Imóvel não encontrado');
    }

    if (imovelExistente.proprietario?.id !== idUsuarioSolicitante) {
      throw new Error('Permissão negada: Você não é o proprietário deste imóvel.');
    }

    await this.imovelRepository.remove(imovelExistente);
    await this.usuarioService.atualizarRoleDinamicamente(idUsuarioSolicitante);
  }
}
