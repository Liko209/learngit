/*
 * @Author: doyle.wu
 * @Date: 2018-12-11 12:00:41
 */
import {
    TaskDto, SceneDto, PerformanceDto, PerformanceItemDto
} from '../models';
class MetriceService {

    async createTask(): Promise<TaskDto> {
        return await TaskDto.create({
            host: process.env.JUPITER_HOST,
            status: '0',
        });
    }

    async updateTaskForEnd(taskDto: TaskDto) {
        await TaskDto.update({
            status: '1',
            endTime: new Date()
        }, { where: { id: taskDto.id } });
    }

    async createScene(taskDto: TaskDto, data, artifacts, startTime: Date, endTime: Date): Promise<SceneDto> {
        return await SceneDto.create({});
    }

    async createPerformance(scene: SceneDto, data, artifacts) {
        console.log(Object.keys(artifacts));
    }

    async createPerformanceItem(scene: SceneDto, data, artifacts) {
        console.log(artifacts.ProcessGatherer);
    }
}

const metriceService = new MetriceService();

export {
    metriceService
}