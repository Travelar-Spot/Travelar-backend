import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Check } from 'typeorm';
import { Usuario } from '../Usuario/entity';
import { Imovel } from '../Imovel/entity';

@Entity('avaliacoes')
@Check(`"nota" >= 1 AND "nota" <= 5`)
export class Avaliacao {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  nota: number;

  @Column({ type: 'text', nullable: true })
  comentario: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.avaliacoes, { onDelete: 'CASCADE' })
  autor: Usuario;

  @ManyToOne(() => Imovel, (imovel) => imovel.avaliacoes, { onDelete: 'CASCADE' })
  imovel: Imovel;
}
