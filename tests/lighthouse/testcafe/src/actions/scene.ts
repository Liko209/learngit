/*
 * @Author: doyle.wu
 * @Date: 2019-05-27 14:53:54
 */
import { Globals, h } from "..";
import { MetricService } from "../services";

const createScene = async (t: TestController): Promise<boolean> => {
  if (!Globals.task) {
    return false;
  }

  const scene = await MetricService.createScene(Globals.task, t);

  h(t).setScene(scene);

  return true;
}

export {
  createScene
}
