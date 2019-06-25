/*
 * @Author: doyle.wu
 * @Date: 2019-05-27 13:30:30
 */
import { CaseFlags } from "../models";
import { createVersion } from "./version";
import { checkEnv } from "./env";
import { createScene } from "./scene";
import { createTask, updateTask } from "./task";
import { createLoadingTime } from "./loadingTimes";

const beforeActions: { [key: string]: Array<(t: TestController) => Promise<boolean>> } = {};
const testActions: { [key: string]: Array<(t: TestController) => Promise<boolean>> } = {};
const afterActions: { [key: string]: Array<(t: TestController) => Promise<boolean>> } = {};

beforeActions[CaseFlags.METRIC] = [createTask];

testActions[CaseFlags.METRIC] = [checkEnv];

afterActions[CaseFlags.METRIC] = [updateTask, createScene, createLoadingTime];

beforeActions[CaseFlags.VERSION] = [];

testActions[CaseFlags.VERSION] = [];

afterActions[CaseFlags.VERSION] = [createVersion];

const acionts = {
  before: beforeActions,
  test: testActions,
  after: afterActions
}

const execActions = async (step: "before" | "test" | "after", flag: CaseFlags, t: TestController): Promise<boolean> => {
  const acts = acionts[step][flag];

  let res = true;
  if (acts) {
    for (let act of acts) {
      res = await act(t);
      if (!res) {
        break;
      }
    }
  }

  return res;
}

export {
  execActions
}
