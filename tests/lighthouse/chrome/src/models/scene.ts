/*
 * @Author: doyle.wu
 * @Date: 2018-12-17 09:03:10
 */
import {
  Table, Column, Model, DataType
} from 'sequelize-typescript';
@Table({ modelName: 't_scene' })
class SceneDto extends Model<SceneDto> {

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
    field: 'task_id',
    type: DataType.BIGINT
  })
  taskId: number;

  @Column({
    allowNull: false,
    field: 'name',
    type: DataType.STRING
  })
  name: string;

  @Column({
    allowNull: false,
    field: 'platform',
    type: DataType.STRING
  })
  platform: string;

  @Column({
    allowNull: false,
    field: 'uri',
    type: DataType.STRING
  })
  uri: string;

  @Column({
    allowNull: false,
    field: 'alias_uri',
    type: DataType.STRING
  })
  aliasUri: string;

  @Column({
    allowNull: false,
    field: 'performance',
    type: DataType.INTEGER
  })
  performance: number;

  @Column({
    allowNull: false,
    field: 'accessibility',
    type: DataType.INTEGER
  })
  accessibility: number;

  @Column({
    allowNull: false,
    field: 'best_practices',
    type: DataType.INTEGER
  })
  bestPractices: number;

  @Column({
    allowNull: false,
    field: 'seo',
    type: DataType.INTEGER
  })
  seo: number;

  @Column({
    allowNull: false,
    field: 'pwa',
    type: DataType.INTEGER
  })
  pwa: number;

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
}

export {
  SceneDto
}
