import { AppDataSource } from '../database/data-source';
import { ContaUsuario } from './entity';

const repositorioContas = AppDataSource.getRepository(ContaUsuario);

export const criarConta = async (dados: Partial<ContaUsuario>): Promise<ContaUsuario> => {
  const { cpf } = dados;
  const contaExistente = await repositorioContas.findOneBy({ cpf });

  if (contaExistente) {
    throw new Error('Já existe uma conta com este CPF.');
  }

  const novaConta = repositorioContas.create(dados);
  return await repositorioContas.save(novaConta);
};

export const listarContas = async (): Promise<ContaUsuario[]> => {
  return await repositorioContas.find();
};

export const buscarContaPorId = async (id: string): Promise<ContaUsuario | null> => {
  return await repositorioContas.findOneBy({ id });
};

export const atualizarConta = async (
  id: string,
  dados: Partial<ContaUsuario>,
): Promise<ContaUsuario> => {
  const contaExistente = await buscarContaPorId(id);

  if (!contaExistente) {
    throw new Error('Conta não encontrada.');
  }

  Object.assign(contaExistente, dados);
  return await repositorioContas.save(contaExistente);
};

export const excluirConta = async (id: string): Promise<void> => {
  const conta = await buscarContaPorId(id);

  if (!conta) {
    throw new Error('Conta não encontrada.');
  }

  await repositorioContas.remove(conta);
};
