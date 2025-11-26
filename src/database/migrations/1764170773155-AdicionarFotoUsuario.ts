import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdicionarFotoUsuario1764170773155 implements MigrationInterface {
  name = 'AdicionarFotoUsuario1764170773155';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('usuarios', 'foto');

    if (!hasColumn) {
      await queryRunner.query(`ALTER TABLE "usuarios" ADD "foto" character varying`);
    }

    await queryRunner.query(`ALTER TABLE "usuarios" ALTER COLUMN "telefone" SET NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "usuarios" ALTER COLUMN "telefone" DROP NOT NULL`);
    if (await queryRunner.hasColumn('usuarios', 'foto')) {
      await queryRunner.query(`ALTER TABLE "usuarios" DROP COLUMN "foto"`);
    }
  }
}
