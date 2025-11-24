import { AppDataSource } from '../database/data-source';
import { Repository } from 'typeorm';
import { RoleUsuario, Usuario } from './entity';

export class UsuarioService {
  constructor(
    private readonly usuarioRepository: Repository<Usuario> = AppDataSource.getRepository(Usuario),
  ) {}

  async listarUsuarios(): Promise<Usuario[]> {
    return this.usuarioRepository.find();
  }

  async buscarUsuarioPorId(id: number): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({ where: { id }, relations: ['imoveis', 'reservas'] });
  }

  async atualizarRoleDinamicamente(usuarioId: number): Promise<void> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuarioId },
      relations: ['imoveis', 'reservas'],
    });

    if (!usuario) return;

    const possuiImovel = usuario.imoveis && usuario.imoveis.length > 0;
    const possuiReserva = usuario.reservas && usuario.reservas.length > 0;

    let novaRole = usuario.role;

    if (possuiImovel && possuiReserva) {
      novaRole = RoleUsuario.AMBOS;
    } else if (possuiImovel) {
      novaRole = RoleUsuario.PROPRIETARIO;
    } else {
      novaRole = RoleUsuario.CLIENTE;
    }

    if (novaRole !== usuario.role) {
      usuario.role = novaRole;
      await this.usuarioRepository.save(usuario);
    }
  }

  async atualizarUsuario(
    id: number,
    dadosAtualizacao: { nome?: string; telefone?: string; foto?: string },
  ): Promise<Usuario> {
    const usuarioEncontrado = await this.usuarioRepository.findOneBy({ id });

    if (!usuarioEncontrado) {
      throw new Error('Usuário não encontrado');
    }

    if (dadosAtualizacao.nome) {
      usuarioEncontrado.nome = dadosAtualizacao.nome;
    }

    if (dadosAtualizacao.telefone) {
      usuarioEncontrado.telefone = dadosAtualizacao.telefone;
    }

    if (dadosAtualizacao.foto) {
      usuarioEncontrado.foto = dadosAtualizacao.foto;
    }

    return await this.usuarioRepository.save(usuarioEncontrado);
  }

  async excluirUsuario(id: number): Promise<void> {
    const usuarioEncontrado = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['imoveis', 'reservas'],
    });

    if (!usuarioEncontrado) {
      throw new Error('Usuário não encontrado');
    }

    const possuiImoveisCadastrados =
      usuarioEncontrado.imoveis && usuarioEncontrado.imoveis.length > 0;
    if (possuiImoveisCadastrados) {
      throw new Error('Não é possível excluir o usuário pois ele possui imóveis cadastrados.');
    }

    const possuiReservasVinculadas =
      usuarioEncontrado.reservas && usuarioEncontrado.reservas.length > 0;
    if (possuiReservasVinculadas) {
      throw new Error('Não é possível excluir o usuário pois ele possui reservas vinculadas.');
    }

    await this.usuarioRepository.remove(usuarioEncontrado);
  }
}
