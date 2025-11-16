import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateContractTenantsTable1700000000006
  implements MigrationInterface
{
  name = 'CreateContractTenantsTable1700000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'contract_tenants',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'contractId',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'tenantId',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'isMainTenant',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'joinDate',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'leaveDate',
            type: 'date',
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
      'contract_tenants',
      new TableForeignKey({
        columnNames: ['contractId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'contracts',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'contract_tenants',
      new TableForeignKey({
        columnNames: ['tenantId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'RESTRICT',
      })
    );

    // Create indexes
    await queryRunner.createIndex(
      'contract_tenants',
      new TableIndex({
        name: 'IDX_CONTRACT_TENANTS_CONTRACT_ID',
        columnNames: ['contractId'],
      })
    );

    await queryRunner.createIndex(
      'contract_tenants',
      new TableIndex({
        name: 'IDX_CONTRACT_TENANTS_TENANT_ID',
        columnNames: ['tenantId'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('contract_tenants');
  }
}
