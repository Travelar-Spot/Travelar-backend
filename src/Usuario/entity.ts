import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { Imovel } from '../Imovel/entity';
import { Reserva } from '../Reserva/entity';
import { Avaliacao } from '../Avaliacao/entity';

export enum RoleUsuario {
  CLIENTE = 'CLIENTE',
  PROPRIETARIO = 'PROPRIETARIO',
  AMBOS = 'AMBOS',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column({ unique: true })
  email: string;

  @Column()
  telefone: string;

  @Column({
    type: 'enum',
    enum: RoleUsuario,
  })
  role: RoleUsuario;

  @Column({ nullable: true })
  foto: string;

  @CreateDateColumn()
  criadoEm: Date;

  @Column({ select: false })
  senhaHash: string;

  @OneToMany(() => Imovel, (imovel) => imovel.proprietario)
  imoveis: Imovel[];

  @OneToMany(() => Reserva, (reserva) => reserva.cliente)
  reservas: Reserva[];

  @OneToMany(() => Avaliacao, (avaliacao) => avaliacao.autor)
  avaliacoes: Avaliacao[];
}
