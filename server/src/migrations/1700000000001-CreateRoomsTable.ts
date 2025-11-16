import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateRoomsTable1700000000001 implements MigrationInterface {
  name = 'CreateRoomsTable1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'rooms',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '20',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'floor',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'area',
            type: 'decimal',
            precision: 6,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'price',
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
            isNullable: true,
          },
          {
            name: 'maxOccupants',
            type: 'integer',
            default: 2,
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'AVAILABLE'",
            isNullable: false,
          },
          {
            name: 'amenities',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
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

    // Create indexes
    await queryRunner.createIndex(
      'rooms',
      new TableIndex({
        name: 'IDX_ROOMS_CODE',
        columnNames: ['code'],
      })
    );

    await queryRunner.createIndex(
      'rooms',
      new TableIndex({
        name: 'IDX_ROOMS_STATUS',
        columnNames: ['status'],
      })
    );

    await queryRunner.createIndex(
      'rooms',
      new TableIndex({
        name: 'IDX_ROOMS_FLOOR',
        columnNames: ['floor'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('rooms');
  }
}
