import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('contas')
export class ContaUsuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ unique: true })
  cpf: string;

  @Column({ type: 'date' })
  dataNascimento: string;

  @Column()
  telefone: string;

  @CreateDateColumn()
  dataCriacao: Date;

  @UpdateDateColumn()
  dataAtualizacao: Date;
}
