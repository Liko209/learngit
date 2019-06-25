/*
 * @Author: doyle.wu
 * @Date: 2019-05-23 09:02:15
 */
import { VersionInfo } from './models';
import { TaskDto } from './dtos';
const Globals: {
  browser?: string,
  browserName?: string,
  task?: TaskDto,
  versions: { [key: string]: VersionInfo },
  startTime?: Date,
  endTime?: Date,
  skipTest: boolean
} = {
  versions: {},
  skipTest: false
}

export {
  Globals
}

