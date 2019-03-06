/*
 * @Author: doyle.wu
 * @Date: 2018-12-17 09:03:10
 */
import {
  Table, Column, Model, Sequelize
} from 'sequelize-typescript';
@Table({ tableName: 't_scene' })
class SceneDto extends Model<SceneDto> {

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
    field: 'task_id',
    type: Sequelize.BIGINT
  })
  taskId: number;

  @Column({
    allowNull: false,
    field: 'name',
    type: Sequelize.STRING
  })
  name: string;

  @Column({
    allowNull: false,
    field: 'platform',
    type: Sequelize.STRING
  })
  platform: string;

  @Column({
    allowNull: false,
    field: 'uri',
    type: Sequelize.STRING
  })
  uri: string;

  @Column({
    allowNull: false,
    field: 'alias_uri',
    type: Sequelize.STRING
  })
  aliasUri: string;

  @Column({
    allowNull: false,
    field: 'performance',
    type: Sequelize.INTEGER
  })
  performance: number;

  @Column({
    allowNull: false,
    field: 'accessibility',
    type: Sequelize.INTEGER
  })
  accessibility: number;

  @Column({
    allowNull: false,
    field: 'best_practices',
    type: Sequelize.INTEGER
  })
  bestPractices: number;

  @Column({
    allowNull: false,
    field: 'seo',
    type: Sequelize.INTEGER
  })
  seo: number;

  @Column({
    allowNull: false,
    field: 'pwa',
    type: Sequelize.INTEGER
  })
  pwa: number;

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
  SceneDto
}
