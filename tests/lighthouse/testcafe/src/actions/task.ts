/*
 * @Author: doyle.wu
 * @Date: 2019-05-27 14:45:08
 */
import { Globals, h, Config } from "..";
import { MetricService } from "../services";

const createTask = async (t: TestController): Promise<boolean> => {
  if (Globals.task) {
    return true;
  }

  const task = await MetricService.createTask(h(t).getVersion(Config.jupiterHost).jupiterVersion);

  Globals.task = task;

  return true;
}

const updateTask = async (t: TestController): Promise<boolean> => {
  if (!Globals.task) {
    return false;
  }

  await MetricService.updateTaskForEnd(Globals.task, "1");

  return true;
}

export {
  createTask,
  updateTask
}
