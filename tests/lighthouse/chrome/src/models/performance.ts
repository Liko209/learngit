/*
 * @Author: doyle.wu
 * @Date: 2018-12-08 18:07:46
 */
import {
  Table, Column, Model, DataType
} from 'sequelize-typescript';
import { IDefineOptions } from 'sequelize-typescript/lib/interfaces/IDefineOptions';
@Table(<IDefineOptions>{
  modelName: 't_performance',
  indexes: [{
    unique: false,
    fields: ['scene_id']
  }]
})
class PerformanceDto extends Model<PerformanceDto> {

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
    field: 'first_contentful_paint',
    type: DataType.DECIMAL(10, 2)
  })
  firstContentfulPaint: number;

  @Column({
    allowNull: false,
    field: 'first_meaningful_paint',
    type: DataType.DECIMAL(10, 2)
  })
  firstMeaningfulPaint: number;

  @Column({
    allowNull: false,
    field: 'speed_index',
    type: DataType.DECIMAL(10, 2)
  })
  speedIndex: number;

  @Column({
    allowNull: false,
    field: 'first_cpu_idle',
    type: DataType.DECIMAL(10, 2)
  })
  firstCpuIdle: number;

  @Column({
    allowNull: false,
    field: 'time_to_interactive',
    type: DataType.DECIMAL(10, 2)
  })
  timeToInteractive: number;

  @Column({
    allowNull: false,
    field: 'estimated_input_latency',
    type: DataType.DECIMAL(10, 2)
  })
  estimatedInputLatency: number;
}

@Table(<IDefineOptions>{
  modelName: 't_performance_item',
  indexes: [{
    unique: false,
    fields: ['scene_id']
  }]
})
class PerformanceItemDto extends Model<PerformanceItemDto> {

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
    field: 'url',
    type: DataType.STRING
  })
  url: string;

  @Column({
    allowNull: false,
    field: 'js_memory_allocated',
    type: DataType.DECIMAL(10, 2)
  })
  jsMemoryAllocated: number;

  @Column({
    allowNull: false,
    field: 'js_memory_used',
    type: DataType.DECIMAL(10, 2)
  })
  jsMemoryUsed: number;

  @Column({
    allowNull: false,
    field: 'private_memory',
    type: DataType.DECIMAL(10, 2)
  })
  privateMemory: number;

  @Column({
    allowNull: false,
    field: 'cpu',
    type: DataType.DECIMAL(10, 2)
  })
  cpu: number;

  @Column({
    allowNull: false,
    field: 'type',
    type: DataType.STRING
  })
  type: string;
}

export {
  PerformanceDto,
  PerformanceItemDto
}
