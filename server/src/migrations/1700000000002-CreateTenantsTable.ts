import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateTenantsTable1700000000002 implements MigrationInterface {
  name = 'CreateTenantsTable1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'tenants',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'fullName',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'dateOfBirth',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'gender',
            type: 'varchar',
            length: '10',
            isNullable: true,
          },
          {
            name: 'idCard',
            type: 'varchar',
            length: '20',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'idCardDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'idCardPlace',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'hometown',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'currentAddress',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'occupation',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'emergencyContact',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'ACTIVE'",
            isNullable: false,
          },
          {
            name: 'note',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true
    );

    // Create indexes
    await queryRunner.createIndex(
      'tenants',
      new TableIndex({
        name: 'IDX_TENANTS_PHONE',
        columnNames: ['phone'],
      })
    );

    await queryRunner.createIndex(
      'tenants',
      new TableIndex({
        name: 'IDX_TENANTS_ID_CARD',
        columnNames: ['idCard'],
      })
    );

    await queryRunner.createIndex(
      'tenants',
      new TableIndex({
        name: 'IDX_TENANTS_STATUS',
        columnNames: ['status'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('tenants');
  }
}
