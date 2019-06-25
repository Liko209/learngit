/*
 * @Author: doyle.wu
 * @Date: 2019-05-27 13:35:35
 */
import { MetricService } from "../services";
import { Config, h } from "..";

const createVersion = async (t: TestController): Promise<boolean> => {
  const info = h(t).getVersion(Config.jupiterHost);

  await MetricService.createVersion(info.jupiterVersion);

  return true;
}

export {
  createVersion
}
