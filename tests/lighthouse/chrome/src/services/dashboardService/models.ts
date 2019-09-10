/*
 * @Author: doyle.wu
 * @Date: 2019-07-05 09:26:28
 */
import { DashboardPair } from './pair';

class DashboardVersionInfo {
  platform: string;
  jupiterVersion: string;
  appVersion: string;
  osInfo: string;
}

class SceneSummary {
  startMemory: number;
  endMemory: number;
  k: number;
  b: number;
  metric: {
    [key: string]: {
      apiAvg: number,
      apiMax: number,
      apiMin: number,
      apiTop90: number,
      apiTop95: number,
      handleCount: number
    }
  }
}

class MemoryDiffItem {
  name: string;
  count: number;
  size: number;
  countChange: string;
  sizeChange: string;
  countChangeForGlip: string;
  sizeChangeForGlip: string;
}

class LongTask {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
}

class DashboardItem {
  sceneId: number;
  metric: {
    [key: string]: {
      apiAvg: DashboardPair,
      apiMax: DashboardPair,
      apiMin: DashboardPair,
      apiTop90: DashboardPair,
      apiTop95: DashboardPair,
      handleCount: number
    }
  };

  k: DashboardPair;
  b: DashboardPair;
  startMemory: DashboardPair;
  memoryGrowth: DashboardPair;
  longTasks: Array<LongTask>;

  memoryDiffArray: Array<Array<MemoryDiffItem>>;
}

export {
  DashboardVersionInfo,
  SceneSummary,
  DashboardItem,
  MemoryDiffItem,
  DashboardPair,
  LongTask
}
