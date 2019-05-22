/*
 * @Author: doyle.wu
 * @Date: 2019-01-11 15:37:54
 */
import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
  modelName: "t_loading_time_summary",
  indexes: [{
    unique: false,
    fields: ['scene_id']
  }]
})
class LoadingTimeSummaryDto extends Model<LoadingTimeSummaryDto> {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: "id",
    type: DataType.BIGINT
  })
  id: number;

  @Column({
    allowNull: false,
    field: "scene_id",
    type: DataType.BIGINT
  })
  sceneId: number;

  @Column({
    allowNull: false,
    field: "name",
    type: DataType.STRING
  })
  name: string;

  @Column({
    allowNull: false,
    field: "ui_max_time",
    type: DataType.DECIMAL(10, 2)
  })
  uiMaxTime: number;

  @Column({
    allowNull: false,
    field: "ui_avg_time",
    type: DataType.DECIMAL(10, 2)
  })
  uiAvgTime: number;

  @Column({
    allowNull: false,
    field: "ui_min_time",
    type: DataType.DECIMAL(10, 2)
  })
  uiMinTime: number;

  @Column({
    allowNull: false,
    field: "ui_top_90_time",
    type: DataType.DECIMAL(10, 2)
  })
  uiTop90Time: number;

  @Column({
    allowNull: false,
    field: "ui_top_95_time",
    type: DataType.DECIMAL(10, 2)
  })
  uiTop95Time: number;

  @Column({
    allowNull: false,
    field: "api_max_time",
    type: DataType.DECIMAL(10, 2)
  })
  apiMaxTime: number;

  @Column({
    allowNull: false,
    field: "api_avg_time",
    type: DataType.DECIMAL(10, 2)
  })
  apiAvgTime: number;

  @Column({
    allowNull: false,
    field: "api_min_time",
    type: DataType.DECIMAL(10, 2)
  })
  apiMinTime: number;

  @Column({
    allowNull: false,
    field: "api_top_90_time",
    type: DataType.DECIMAL(10, 2)
  })
  apiTop90Time: number;

  @Column({
    allowNull: false,
    field: "api_top_95_time",
    type: DataType.DECIMAL(10, 2)
  })
  apiTop95Time: number;

  @Column({
    allowNull: false,
    field: "api_handle_count",
    type: DataType.DECIMAL(10, 2)
  })
  apiHandleCount: number;
}

@Table({
  modelName: "t_loading_time_item",
  indexes: [{
    unique: false,
    fields: ['summary_id']
  }]
})
class LoadingTimeItemDto extends Model<LoadingTimeItemDto> {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: "id",
    type: DataType.BIGINT
  })
  id: number;

  @Column({
    allowNull: false,
    field: "summary_id",
    type: DataType.BIGINT
  })
  summaryId: number;

  @Column({
    allowNull: false,
    type: DataType.ENUM("UI", "API"),
    defaultValue: "API",
    field: "type"
  })
  type: string;

  @Column({
    allowNull: false,
    field: "start_time",
    type: DataType.DECIMAL(10, 2)
  })
  startTime: number;

  @Column({
    allowNull: false,
    field: "end_time",
    type: DataType.DECIMAL(10, 2)
  })
  endTime: number;

  @Column({
    allowNull: false,
    field: "cost_time",
    type: DataType.DECIMAL(10, 2)
  })
  costTime: number;

  @Column({
    allowNull: false,
    field: "handle_count",
    type: DataType.DECIMAL(10, 2)
  })
  handleCount: number;
}

export { LoadingTimeItemDto, LoadingTimeSummaryDto };
