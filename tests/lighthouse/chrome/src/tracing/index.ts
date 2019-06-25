/*
 * @Author: doyle.wu
 * @Date: 2019-05-31 08:33:35
 *
 * copy from https://github.com/ChromeDevTools/devtools-frontend/blob/master/front_end/sdk/TracingModel.js
 */
import * as fs from 'fs';
import { Config } from '../config';
import { TracingModel, LocationOfCode, SourceCode } from './model';
import { summariseTimeoutCode } from './codeMap';

const timeoutCodeMap: { [key: string]: LocationOfCode } = {}

const parseTracing = async (file: string) => {
  const content = fs.readFileSync(file, 'utf-8');
  const events = JSON.parse(content);

  const model = new TracingModel();

  model.addEvents(events);

  model.tracingComplete();

  let key, location;
  for (const process of model._processById.values()) {
    for (const thread of process._threads.values()) {
      for (let event of thread._events) {
        if (event.name === 'FunctionCall'
          && event.duration && event.duration > Config.functionTimeout
          && event.args && event.args.data) {
          let { url, lineNumber, columnNumber } = event.args.data;
          if (url && lineNumber >= 0 && columnNumber >= 0) {
            key = `${url}:${lineNumber}:${columnNumber}`;

            location = <LocationOfCode>{
              url, line: lineNumber, column: columnNumber, during: event.duration
            }
            if (!timeoutCodeMap[key]) {
              timeoutCodeMap[key] = location;
            }

            if (timeoutCodeMap[key].during < location.during) {
              timeoutCodeMap[key].during = location.during;
            }
          }
        }
      }
    }
  }
}

const summariseTracing = async (): Promise<Array<SourceCode>> => {
  return await summariseTimeoutCode(timeoutCodeMap);
}


export {
  parseTracing,
  summariseTracing,
  LocationOfCode,
  SourceCode
}
