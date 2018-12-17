/*
 * @Author: doyle.wu
 * @Date: 2018-12-08 18:07:46
 */
import {
    Table, Column, Model, Sequelize
} from 'sequelize-typescript';

@Table({ tableName: 't_performance' })
class PerformanceDto extends Model<PerformanceDto> {

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
        field: 'first_contentful_paint',
        type: Sequelize.BIGINT
    })
    firstContentfulPaint: number;

    @Column({
        allowNull: false,
        field: 'first_meaningful_paint',
        type: Sequelize.BIGINT
    })
    firstMeaningfulPaint: number;

    @Column({
        allowNull: false,
        field: 'speed_index',
        type: Sequelize.BIGINT
    })
    speedIndex: number;

    @Column({
        allowNull: false,
        field: 'first_cpu_idle',
        type: Sequelize.BIGINT
    })
    firstCpuIdle: number;

    @Column({
        allowNull: false,
        field: 'time_to_interactive',
        type: Sequelize.BIGINT
    })
    timeToInteractive: number;

    @Column({
        allowNull: false,
        field: 'estimated_input_latency',
        type: Sequelize.BIGINT
    })
    estimatedInputLatency: number;
}

@Table({ tableName: 't_performance_item' })
class PerformanceItemDto extends Model<PerformanceItemDto> {

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
        type: Sequelize.BIGINT
    })
    index: number;

    @Column({
        allowNull: false,
        field: 'memory',
        type: Sequelize.BIGINT
    })
    memory: number;

    @Column({
        allowNull: false,
        field: 'cpu',
        type: Sequelize.BIGINT
    })
    cpu: number;
}

export {
    PerformanceDto,
    PerformanceItemDto
}