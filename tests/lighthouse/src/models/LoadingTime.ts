/*
 * @Author: doyle.wu
 * @Date: 2019-01-11 15:37:54
 */
import { Table, Column, Model, Sequelize } from "sequelize-typescript";

@Table({ tableName: "t_loading_time_summary" })
class LoadingTimeSummaryDto extends Model<LoadingTimeSummaryDto> {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: "id",
    type: Sequelize.BIGINT
  })
  id: number;

  @Column({
    allowNull: false,
    field: "scene_id",
    type: Sequelize.BIGINT
  })
  sceneId: number;

  @Column({
    allowNull: false,
    field: "name",
    type: Sequelize.STRING
  })
  name: string;

  @Column({
    allowNull: false,
    field: "max_time",
    type: Sequelize.DECIMAL(10, 2)
  })
  uiMaxTime: number;

  @Column({
    allowNull: false,
    field: "avg_time",
    type: Sequelize.DECIMAL(10, 2)
  })
  uiAvgTime: number;

  @Column({
    allowNull: false,
    field: "min_time",
    type: Sequelize.DECIMAL(10, 2)
  })
  uiMinTime: number;

  @Column({
    allowNull: false,
    field: "top_90_time",
    type: Sequelize.DECIMAL(10, 2)
  })
  uiTop90Time: number;

  @Column({
    allowNull: false,
    field: "top_95_time",
    type: Sequelize.DECIMAL(10, 2)
  })
  uiTop95Time: number;

  @Column({
    allowNull: false,
    field: "max_time",
    type: Sequelize.DECIMAL(10, 2)
  })
  apiMaxTime: number;

  @Column({
    allowNull: false,
    field: "avg_time",
    type: Sequelize.DECIMAL(10, 2)
  })
  apiAvgTime: number;

  @Column({
    allowNull: false,
    field: "min_time",
    type: Sequelize.DECIMAL(10, 2)
  })
  apiMinTime: number;

  @Column({
    allowNull: false,
    field: "top_90_time",
    type: Sequelize.DECIMAL(10, 2)
  })
  apiTop90Time: number;

  @Column({
    allowNull: false,
    field: "top_95_time",
    type: Sequelize.DECIMAL(10, 2)
  })
  apiTop95Time: number;
}

@Table({ tableName: "t_loading_time_item" })
class LoadingTimeItemDto extends Model<LoadingTimeItemDto> {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: "id",
    type: Sequelize.BIGINT
  })
  id: number;

  @Column({
    allowNull: false,
    field: "summary_id",
    type: Sequelize.BIGINT
  })
  summaryId: number;

  @Column({
    allowNull: false,
    type: Sequelize.ENUM("UI", "API"),
    defaultValue: "API",
    field: "type"
  })
  type: string;

  @Column({
    allowNull: false,
    field: "start_time",
    type: Sequelize.DECIMAL(10, 2)
  })
  statTime: number;

  @Column({
    allowNull: false,
    field: "end_time",
    type: Sequelize.DECIMAL(10, 2)
  })
  endTime: number;

  @Column({
    allowNull: false,
    field: "cost_time",
    type: Sequelize.DECIMAL(10, 2)
  })
  costTime: number;
}

export { LoadingTimeItemDto, LoadingTimeSummaryDto };
