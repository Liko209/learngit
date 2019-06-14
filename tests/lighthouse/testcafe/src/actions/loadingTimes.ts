/*
 * @Author: doyle.wu
 * @Date: 2019-05-27 15:06:28
 */
import { h } from "..";
import { MetricService, DashboardService } from "../services";

const createLoadingTime = async (t: TestController): Promise<boolean> => {
  const scene = h(t).getScene();
  if (!scene) {
    return false;
  }

  await MetricService.createLoadingTime(scene, t);

  await DashboardService.addItem(scene);

  return true;
}

export {
  createLoadingTime
}
