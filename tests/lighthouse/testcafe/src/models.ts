/*
 * @Author: doyle.wu
 * @Date: 2019-05-23 15:39:29
 */
class PerformanceInfo {
  key: string;
  time?: number;
  count?: number = -1;
  infos?: any = {};
};

class VersionInfo {
  platform: string;
  browser: string;
  jupiterVersion: string;
  appVersion: string;
  osInfo: string;
}

enum CaseFlags {
  VERSION,
  METRIC
}

export {
  PerformanceInfo,
  VersionInfo,
  CaseFlags
}
