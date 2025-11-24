import { Repository } from 'typeorm';
import { Avaliacao } from './entity';
import { Usuario } from '../Usuario/entity';
import { Imovel } from '../Imovel/entity';
import { AppDataSource } from '../database/data-source';

export class AvaliacaoService {
  constructor(
    private readonly avaliacaoRepository: Repository<Avaliacao> = AppDataSource.getRepository(
      Avaliacao,
    ),
    private readonly usuarioRepository: Repository<Usuario> = AppDataSource.getRepository(Usuario),
    private readonly imovelRepository: Repository<Imovel> = AppDataSource.getRepository(Imovel),
  ) {}

  async criarAvaliacao(dados: {
    autorId: number;
    imovelId: number;
    nota: number;
    comentario: string;
  }): Promise<Avaliacao> {
    const { autorId, imovelId, nota, comentario } = dados;

    const autorEncontrado = await this.usuarioRepository.findOne({ where: { id: autorId } });
    if (!autorEncontrado) {
      throw new Error('Usuário (autor) não encontrado');
    }

    const imovelEncontrado = await this.imovelRepository.findOne({ where: { id: imovelId } });
    if (!imovelEncontrado) {
      throw new Error('Imóvel não encontrado');
    }

    const novaAvaliacao = this.avaliacaoRepository.create({
      autor: autorEncontrado,
      imovel: imovelEncontrado,
      nota: nota,
      comentario: comentario,
    });

    return await this.avaliacaoRepository.save(novaAvaliacao);
  }

  async listarTodasAvaliacoes(): Promise<Avaliacao[]> {
    return this.avaliacaoRepository.find({
      relations: ['autor', 'imovel'],
    });
  }

  async listarAvaliacoesPorImovel(imovelId: number): Promise<Avaliacao[]> {
    return this.avaliacaoRepository.find({
      where: { imovel: { id: imovelId } },
      relations: ['autor', 'imovel'],
    });
  }

  async listarAvaliacoesPorUsuario(usuarioId: number): Promise<Avaliacao[]> {
    return this.avaliacaoRepository.find({
      where: { autor: { id: usuarioId } },
      relations: ['autor', 'imovel'],
    });
  }

  async excluirAvaliacao(id: number): Promise<void> {
    const avaliacaoEncontrada = await this.avaliacaoRepository.findOne({ where: { id } });
    if (!avaliacaoEncontrada) {
      throw new Error('Avaliação não encontrada');
    }
    await this.avaliacaoRepository.remove(avaliacaoEncontrada);
  }
}
