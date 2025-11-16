import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateRoomImagesTable1700000000009 implements MigrationInterface {
  name = 'CreateRoomImagesTable1700000000009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'room_images',
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
            name: 'url',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'varchar',
            length: '20',
            default: "'GALLERY'",
            isNullable: false,
          },
          {
            name: 'caption',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'order',
            type: 'integer',
            default: 0,
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

    // Create foreign key
    await queryRunner.createForeignKey(
      'room_images',
      new TableForeignKey({
        columnNames: ['roomId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'rooms',
        onDelete: 'CASCADE',
      })
    );

    // Create index
    await queryRunner.createIndex(
      'room_images',
      new TableIndex({
        name: 'IDX_ROOM_IMAGES_ROOM_ID',
        columnNames: ['roomId'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('room_images');
  }
}
