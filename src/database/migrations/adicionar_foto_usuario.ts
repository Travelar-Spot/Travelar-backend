import { MigrationInterface, QueryRunner } from 'typeorm';

export class adicionar_foto_usuario implements MigrationInterface {
  name = 'adicionar_foto_usuario';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "usuarios" ADD "foto" character varying`);
    await queryRunner.query(`ALTER TABLE "usuarios" ALTER COLUMN "telefone" SET NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "usuarios" ALTER COLUMN "telefone" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "usuarios" DROP COLUMN "foto"`);
  }
}
