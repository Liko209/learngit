/*
 * @Author: doyle.wu
 * @Date: 2018-12-17 09:02:45
 */
import {
  Table, Column, Model, Sequelize
} from 'sequelize-typescript';

@Table({ tableName: 't_task' })
class TaskDto extends Model<TaskDto> {

  @Column({
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'id',
    type: Sequelize.BIGINT
  })
  id: number;

  @Column({
    allowNull: false,
    comment: 'host',
    field: 'host',
    type: Sequelize.STRING
  })
  host: string;

  @Column({
    allowNull: false,
    type: Sequelize.ENUM('0', '1'), // 1: success, 0: failure
    defaultValue: '1',
    field: 'status',
  })
  status: string;

  @Column({
    allowNull: true,
    type: Sequelize.DATE,
    field: 'start_time',
  })
  startTime?: Date;

  @Column({
    allowNull: true,
    type: Sequelize.DATE,
    field: 'end_time',
  })
  endTime?: Date;
}

export {
  TaskDto
}
