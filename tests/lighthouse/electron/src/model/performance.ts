/*
 * @Author: doyle.wu
 * @Date: 2019-02-25 14:47:45
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
        type: Sequelize.DECIMAL(10, 2)
    })
    firstContentfulPaint: number;

    @Column({
        allowNull: false,
        field: 'first_meaningful_paint',
        type: Sequelize.DECIMAL(10, 2)
    })
    firstMeaningfulPaint: number;

    @Column({
        allowNull: false,
        field: 'speed_index',
        type: Sequelize.DECIMAL(10, 2)
    })
    speedIndex: number;

    @Column({
        allowNull: false,
        field: 'first_cpu_idle',
        type: Sequelize.DECIMAL(10, 2)
    })
    firstCpuIdle: number;

    @Column({
        allowNull: false,
        field: 'time_to_interactive',
        type: Sequelize.DECIMAL(10, 2)
    })
    timeToInteractive: number;

    @Column({
        allowNull: false,
        field: 'estimated_input_latency',
        type: Sequelize.DECIMAL(10, 2)
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
        type: Sequelize.INTEGER
    })
    index: number;

    @Column({
        allowNull: false,
        field: 'url',
        type: Sequelize.STRING
    })
    url: string;

    @Column({
        allowNull: false,
        field: 'js_memory_allocated',
        type: Sequelize.DECIMAL(10, 2)
    })
    jsMemoryAllocated: number;

    @Column({
        allowNull: false,
        field: 'js_memory_used',
        type: Sequelize.DECIMAL(10, 2)
    })
    jsMemoryUsed: number;

    @Column({
        allowNull: false,
        field: 'private_memory',
        type: Sequelize.DECIMAL(10, 2)
    })
    privateMemory: number;

    @Column({
        allowNull: false,
        field: 'cpu',
        type: Sequelize.DECIMAL(10, 2)
    })
    cpu: number;

    @Column({
        allowNull: false,
        field: 'type',
        type: Sequelize.STRING
    })
    type: string;
}

export {
    PerformanceDto,
    PerformanceItemDto
}
