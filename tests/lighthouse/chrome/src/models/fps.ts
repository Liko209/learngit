/*
 * @Author: doyle.wu
 * @Date: 2018-12-08 18:07:46
 */
import {
  Table, Column, Model, Sequelize
} from 'sequelize-typescript';

@Table({ tableName: 't_fps' })
class FpsDto extends Model<FpsDto> {

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
    field: 'scene_id',
    type: Sequelize.BIGINT
  })
  sceneId: number;

  @Column({
    allowNull: false,
    field: 'index',
    type: Sequelize.INTEGER
  })
  index: number;

  @Column({
    allowNull: false,
    field: 'time',
    type: Sequelize.STRING
  })
  time: string;

  @Column({
    allowNull: false,
    field: 'min',
    type: Sequelize.DECIMAL(10, 2)
  })
  min: number;

  @Column({
    allowNull: false,
    field: 'max',
    type: Sequelize.DECIMAL(10, 2)
  })
  max: number;

  @Column({
    allowNull: false,
    field: 'avg',
    type: Sequelize.DECIMAL(10, 2)
  })
  avg: number;

  @Column({
    allowNull: false,
    field: 'top90',
    type: Sequelize.DECIMAL(10, 2)
  })
  top90: number;

  @Column({
    allowNull: false,
    field: 'top95',
    type: Sequelize.DECIMAL(10, 2)
  })
  top95: number;
}

export {
  FpsDto
}
