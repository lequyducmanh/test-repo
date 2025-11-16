import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateRoomServicesTable1700000000004
  implements MigrationInterface
{
  name = 'CreateRoomServicesTable1700000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'room_services',
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
            name: 'customPrice',
            type: 'decimal',
            precision: 12,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'startDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'endDate',
            type: 'date',
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
      'room_services',
      new TableForeignKey({
        columnNames: ['roomId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'rooms',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'room_services',
      new TableForeignKey({
        columnNames: ['serviceId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'services',
        onDelete: 'CASCADE',
      })
    );

    // Create indexes
    await queryRunner.createIndex(
      'room_services',
      new TableIndex({
        name: 'IDX_ROOM_SERVICES_ROOM_ID',
        columnNames: ['roomId'],
      })
    );

    await queryRunner.createIndex(
      'room_services',
      new TableIndex({
        name: 'IDX_ROOM_SERVICES_SERVICE_ID',
        columnNames: ['serviceId'],
      })
    );

    // Create unique constraint for roomId + serviceId
    await queryRunner.createIndex(
      'room_services',
      new TableIndex({
        name: 'IDX_ROOM_SERVICES_UNIQUE',
        columnNames: ['roomId', 'serviceId'],
        isUnique: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('room_services');
  }
}
