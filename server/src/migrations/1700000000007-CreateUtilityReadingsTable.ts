import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateUtilityReadingsTable1700000000007
  implements MigrationInterface
{
  name = 'CreateUtilityReadingsTable1700000000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'utility_readings',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'roomId',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'serviceId',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'month',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'year',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'previousReading',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
            isNullable: false,
          },
          {
            name: 'currentReading',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'consumption',
            type: 'decimal',
            precision: 10,
            scale: 2,
            generatedType: 'STORED',
            asExpression: '"currentReading" - "previousReading"',
            isNullable: false,
          },
          {
            name: 'readingDate',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'readBy',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'images',
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
      'utility_readings',
      new TableForeignKey({
        columnNames: ['roomId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'rooms',
        onDelete: 'RESTRICT',
      })
    );

    await queryRunner.createForeignKey(
      'utility_readings',
      new TableForeignKey({
        columnNames: ['serviceId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'services',
        onDelete: 'RESTRICT',
      })
    );

    await queryRunner.createForeignKey(
      'utility_readings',
      new TableForeignKey({
        columnNames: ['readBy'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      })
    );

    // Create indexes
    await queryRunner.createIndex(
      'utility_readings',
      new TableIndex({
        name: 'IDX_UTILITY_READINGS_ROOM_ID',
        columnNames: ['roomId'],
      })
    );

    await queryRunner.createIndex(
      'utility_readings',
      new TableIndex({
        name: 'IDX_UTILITY_READINGS_MONTH_YEAR',
        columnNames: ['month', 'year'],
      })
    );

    // Create unique constraint for roomId + serviceId + month + year
    await queryRunner.createIndex(
      'utility_readings',
      new TableIndex({
        name: 'IDX_UTILITY_READINGS_UNIQUE',
        columnNames: ['roomId', 'serviceId', 'month', 'year'],
        isUnique: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('utility_readings');
  }
}
