import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Usuario } from '../Usuario/entity';
import { Imovel } from '../Imovel/entity';

export enum ReservaStatus {
  PENDENTE = 'PENDENTE',
  CONFIRMADA = 'CONFIRMADA',
  CANCELADA_CLIENTE = 'CANCELADA_CLIENTE',
  CANCELADA_PROPRIETARIO = 'CANCELADA_PROPRIETARIO',
  CONCLUIDA = 'CONCLUIDA',
}

@Entity('reservas')
export class Reserva {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.reservas)
  cliente: Usuario;

  @ManyToOne(() => Imovel, (imovel) => imovel.reservas)
  imovel: Imovel;

  @Column({ type: 'date' })
  dataInicio: Date;

  @Column({ type: 'date' })
  dataFim: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorTotal: number;

  @Column({
    type: 'enum',
    enum: ReservaStatus,
    default: ReservaStatus.PENDENTE,
  })
  status: ReservaStatus;

  @CreateDateColumn()
  criadoEm: Date;
}
