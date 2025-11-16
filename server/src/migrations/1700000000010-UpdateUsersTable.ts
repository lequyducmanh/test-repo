import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateUsersTable1700000000010 implements MigrationInterface {
  name = 'UpdateUsersTable1700000000010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add password column
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'password',
        type: 'varchar',
        length: '255',
        isNullable: false,
        default: "'password123'", // Temporary default
      })
    );

    // Add role column
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'role',
        type: 'varchar',
        length: '20',
        default: "'STAFF'",
        isNullable: false,
      })
    );

    // Add phone column
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'phone',
        type: 'varchar',
        length: '20',
        isNullable: true,
      })
    );

    // Add avatar column
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'avatar',
        type: 'varchar',
        length: '255',
        isNullable: true,
      })
    );

    // Add isActive column
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'isActive',
        type: 'boolean',
        default: true,
        isNullable: false,
      })
    );

    // Add lastLoginAt column
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'lastLoginAt',
        type: 'timestamp',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'lastLoginAt');
    await queryRunner.dropColumn('users', 'isActive');
    await queryRunner.dropColumn('users', 'avatar');
    await queryRunner.dropColumn('users', 'phone');
    await queryRunner.dropColumn('users', 'role');
    await queryRunner.dropColumn('users', 'password');
  }
}
