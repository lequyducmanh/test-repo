import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateServicesTable1700000000003 implements MigrationInterface {
  name = 'CreateServicesTable1700000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'services',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 12,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'unit',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'isRequired',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
            isNullable: false,
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
      'services',
      new TableIndex({
        name: 'IDX_SERVICES_TYPE',
        columnNames: ['type'],
      })
    );

    await queryRunner.createIndex(
      'services',
      new TableIndex({
        name: 'IDX_SERVICES_IS_ACTIVE',
        columnNames: ['isActive'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('services');
  }
}
