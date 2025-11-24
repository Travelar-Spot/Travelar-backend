import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Usuario } from '../Usuario/entity';
import { Reserva } from '../Reserva/entity';
import { Avaliacao } from '../Avaliacao/entity';

export enum TipoImovel {
  QUARTO = 'QUARTO',
  CASA = 'CASA',
  APARTAMENTO = 'APARTAMENTO',
  CHACARA = 'CHACARA',
}

@Entity('imoveis')
export class Imovel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column()
  descricao: string;

  @Column({
    type: 'enum',
    enum: TipoImovel,
  })
  tipo: TipoImovel;

  @Column()
  endereco: string;

  @Column()
  cidade: string;

  @Column('decimal', { precision: 10, scale: 2 })
  precoPorNoite: number;

  @Column()
  capacidade: number;

  @Column({ default: true })
  disponivel: boolean;

  @Column({ nullable: true })
  foto: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.imoveis, { onDelete: 'CASCADE' })
  proprietario: Usuario;

  @OneToMany(() => Reserva, (reserva) => reserva.imovel)
  reservas: Reserva[];

  @OneToMany(() => Avaliacao, (avaliacao) => avaliacao.imovel)
  avaliacoes: Avaliacao[];
}

export { Reserva };
