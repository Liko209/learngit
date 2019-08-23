/*
 * @Author: doyle.wu
 * @Date: 2019-07-02 17:21:24
 */

import {
  Table, Column, Model, DataType
} from 'sequelize-typescript';


import { IDefineOptions } from 'sequelize-typescript/lib/interfaces/IDefineOptions';
@Table(<IDefineOptions>{
  modelName: 't_memory_summary',
  indexes: [{
    unique: false,
    fields: ['scene_name']
  }, {
    unique: false,
    fields: ['version_id']
  }, {
    unique: false,
    fields: ['platform']
  }]
})
class MemorySummaryDto extends Model<MemorySummaryDto> {

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
    field: "scene_name",
    type: DataType.STRING
  })
  sceneName: string;

  @Column({
    allowNull: false,
    field: 'start_memory',
    type: DataType.DECIMAL(10, 2)
  })
  startMemory: number;

  @Column({
    allowNull: false,
    field: 'end_memory',
    type: DataType.DECIMAL(10, 2)
  })
  endMemory: number;

  @Column({
    allowNull: false,
    field: 'k',
    type: DataType.DECIMAL(10, 2)
  })
  k: number;

  @Column({
    allowNull: false,
    field: 'b',
    type: DataType.DECIMAL(10, 2)
  })
  b: number;

  @Column({
    allowNull: false,
    type: DataType.BOOLEAN,
    field: 'is_release'
  })
  isRelease: boolean;

  @Column({
    allowNull: false,
    field: "version_id",
    type: DataType.BIGINT
  })
  versionId: number;

  @Column({
    allowNull: false,
    field: "platform",
    type: DataType.STRING
  })
  platform: string;

  @Column({
    allowNull: false,
    field: "version",
    type: DataType.STRING
  })
  version: string;
}

@Table(<IDefineOptions>{
  modelName: "t_memory",
  indexes: [{
    unique: false,
    fields: ['scene_name']
  }, {
    unique: false,
    fields: ['version_id']
  }, {
    unique: false,
    fields: ['platform']
  }]
})
class MemoryDto extends MemorySummaryDto {

  @Column({
    allowNull: false,
    field: 'scene_id',
    type: DataType.BIGINT
  })
  sceneId: number;
}

export {
  MemoryDto,
  MemorySummaryDto
}
