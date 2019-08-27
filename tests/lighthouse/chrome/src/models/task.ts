/*
 * @Author: doyle.wu
 * @Date: 2018-12-17 09:02:45
 */
import {
  Table, Column, Model, DataType
} from 'sequelize-typescript';
import { IDefineOptions } from 'sequelize-typescript/lib/interfaces/IDefineOptions';
@Table(<IDefineOptions>{ modelName: 't_task' })
class TaskDto extends Model<TaskDto> {

  @Column({
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'id',
    type: DataType.BIGINT
  })
  id: number;

  @Column({
    allowNull: false,
    comment: 'host',
    field: 'host',
    type: DataType.STRING
  })
  host: string;

  @Column({
    allowNull: false,
    type: DataType.ENUM('0', '1'), // 1: success, 0: failure
    defaultValue: '1',
    field: 'status',
  })
  status: string;

  @Column({
    allowNull: true,
    type: DataType.DATE,
    field: 'start_time',
  })
  startTime?: Date;

  @Column({
    allowNull: true,
    type: DataType.DATE,
    field: 'end_time',
  })
  endTime?: Date;

  @Column({
    allowNull: false,
    type: DataType.STRING,
    field: 'app_version'
  })
  appVersion: string;

  @Column({
    allowNull: false,
    type: DataType.BOOLEAN,
    field: 'is_release'
  })
  isRelease: boolean;
}

export {
  TaskDto
}
