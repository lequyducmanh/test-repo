import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateMaintenanceTable1700000000008 implements MigrationInterface {
  name = 'CreateMaintenanceTable1700000000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'maintenance',
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
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'varchar',
            length: '20',
            default: "'REPAIR'",
            isNullable: false,
          },
          {
            name: 'priority',
            type: 'varchar',
            length: '20',
            default: "'MEDIUM'",
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'PENDING'",
            isNullable: false,
          },
          {
            name: 'reportedBy',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'assignedTo',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'cost',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0,
            isNullable: false,
          },
          {
            name: 'scheduledDate',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'completedDate',
            type: 'timestamp',
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
      'maintenance',
      new TableForeignKey({
        columnNames: ['roomId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'rooms',
        onDelete: 'RESTRICT',
      })
    );

    await queryRunner.createForeignKey(
      'maintenance',
      new TableForeignKey({
        columnNames: ['reportedBy'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'SET NULL',
      })
    );

    await queryRunner.createForeignKey(
      'maintenance',
      new TableForeignKey({
        columnNames: ['assignedTo'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      })
    );

    // Create indexes
    await queryRunner.createIndex(
      'maintenance',
      new TableIndex({
        name: 'IDX_MAINTENANCE_ROOM_ID',
        columnNames: ['roomId'],
      })
    );

    await queryRunner.createIndex(
      'maintenance',
      new TableIndex({
        name: 'IDX_MAINTENANCE_STATUS',
        columnNames: ['status'],
      })
    );

    await queryRunner.createIndex(
      'maintenance',
      new TableIndex({
        name: 'IDX_MAINTENANCE_PRIORITY',
        columnNames: ['priority'],
      })
    );

    await queryRunner.createIndex(
      'maintenance',
      new TableIndex({
        name: 'IDX_MAINTENANCE_ASSIGNED_TO',
        columnNames: ['assignedTo'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('maintenance');
  }
}
