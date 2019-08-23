/*
 * @Author: doyle.wu
 * @Date: 2018-12-08 18:07:46
 */
import {
  Table, Column, Model, DataType
} from 'sequelize-typescript';

import { IDefineOptions } from 'sequelize-typescript/lib/interfaces/IDefineOptions';
@Table(<IDefineOptions>{
  modelName: 't_fps',
  indexes: [{
    unique: false,
    fields: ['scene_id']
  }]
})
class FpsDto extends Model<FpsDto> {

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
    field: 'scene_id',
    type: DataType.BIGINT
  })
  sceneId: number;

  @Column({
    allowNull: false,
    field: 'index',
    type: DataType.INTEGER
  })
  index: number;

  @Column({
    allowNull: false,
    field: 'time',
    type: DataType.STRING
  })
  time: string;

  @Column({
    allowNull: false,
    field: 'min',
    type: DataType.DECIMAL(10, 2)
  })
  min: number;

  @Column({
    allowNull: false,
    field: 'max',
    type: DataType.DECIMAL(10, 2)
  })
  max: number;

  @Column({
    allowNull: false,
    field: 'avg',
    type: DataType.DECIMAL(10, 2)
  })
  avg: number;

  @Column({
    allowNull: false,
    field: 'top90',
    type: DataType.DECIMAL(10, 2)
  })
  top90: number;

  @Column({
    allowNull: false,
    field: 'top95',
    type: DataType.DECIMAL(10, 2)
  })
  top95: number;
}

export {
  FpsDto
}
