import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateContractsTable1700000000005 implements MigrationInterface {
  name = 'CreateContractsTable1700000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'contracts',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'contractCode',
            type: 'varchar',
            length: '50',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'roomId',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'mainTenantId',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'startDate',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'endDate',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'monthlyRent',
            type: 'decimal',
            precision: 12,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'deposit',
            type: 'decimal',
            precision: 12,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'paymentDueDay',
            type: 'integer',
            default: 5,
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'DRAFT'",
            isNullable: false,
          },
          {
            name: 'terminationDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'terminationReason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'terms',
            type: 'jsonb',
            isNullable: true,
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

    // Create foreign keys
    await queryRunner.createForeignKey(
      'contracts',
      new TableForeignKey({
        columnNames: ['roomId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'rooms',
        onDelete: 'RESTRICT',
      })
    );

    await queryRunner.createForeignKey(
      'contracts',
      new TableForeignKey({
        columnNames: ['mainTenantId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'RESTRICT',
      })
    );

    // Create indexes
    await queryRunner.createIndex(
      'contracts',
      new TableIndex({
        name: 'IDX_CONTRACTS_ROOM_ID',
        columnNames: ['roomId'],
      })
    );

    await queryRunner.createIndex(
      'contracts',
      new TableIndex({
        name: 'IDX_CONTRACTS_MAIN_TENANT_ID',
        columnNames: ['mainTenantId'],
      })
    );

    await queryRunner.createIndex(
      'contracts',
      new TableIndex({
        name: 'IDX_CONTRACTS_STATUS',
        columnNames: ['status'],
      })
    );

    await queryRunner.createIndex(
      'contracts',
      new TableIndex({
        name: 'IDX_CONTRACTS_END_DATE',
        columnNames: ['endDate'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('contracts');
  }
}
