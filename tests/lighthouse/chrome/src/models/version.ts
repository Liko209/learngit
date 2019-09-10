/*
 * @Author: doyle.wu
 * @Date: 2018-12-17 09:03:10
 */
import {
  Table, Column, Model, DataType
} from 'sequelize-typescript';
import { IDefineOptions } from 'sequelize-typescript/lib/interfaces/IDefineOptions';
@Table(<IDefineOptions>{
  modelName: 't_version'
})
class VersionDto extends Model<VersionDto> {

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
    field: 'name',
    type: DataType.STRING,
    unique: true
  })
  name: string;

  @Column({
    allowNull: true,
    type: DataType.DATE,
    field: 'start_time',
  })
  startTime: Date;

  @Column({
    allowNull: true,
    type: DataType.DATE,
    field: 'end_time',
  })
  endTime?: Date;

  @Column({
    allowNull: false,
    type: DataType.BOOLEAN,
    field: 'is_release'
  })
  isRelease: boolean;
}

export {
  VersionDto
}
