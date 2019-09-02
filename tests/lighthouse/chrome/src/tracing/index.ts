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
import { Node } from './node';
import { Task } from './task';

const timeoutCodeMap: { [key: string]: LocationOfCode } = {}

const parseTracing = async (file: string) => {
  const content = fs.readFileSync(file, 'utf-8');
  const events = JSON.parse(content);

  const model = new TracingModel();

  model.addEvents(events);

  model.tracingComplete();

  let parent: Node, node: Node;
  let idToNode: { [key: string]: Node } = {};
  let tasks = [];
  let taskMap: { [key: string]: Task } = {};
  for (const process of model._processById.values()) {
    for (const thread of process._threads.values()) {
      for (let event of thread._events) {
        if (event.name !== 'ProfileChunk') {
          continue;
        }

        if (event.args.data.cpuProfile) {
          if (event.args.data.cpuProfile.nodes) {
            for (let n of event.args.data.cpuProfile.nodes) {
              node = new Node(event.id, n.id, n.callFrame);
              if (idToNode[node.key()]) {
                //console.log(idToNode[node.key()], '=====', node)
                // throw new Error('!!!!!');
              }

              parent = undefined;
              if (n.parent) {
                parent = idToNode[[event.id, n.parent].join('_')];
              }

              node.parent = parent;
              idToNode[node.key()] = node;
            }
          }
          if (event.args.data.cpuProfile.samples && event.args.data.timeDeltas) {
            let samples = event.args.data.cpuProfile.samples;
            let timeDeltas = event.args.data.timeDeltas;
            if (samples.length !== timeDeltas.length) {
              throw new Error('-----');
            }

            for (let i = 0; i < samples.length; i++) {

              node = idToNode[[event.id, samples[i]].join('_')];
              if (node.isSystem()) {
                taskMap[event.id] = undefined;
                continue;
              }

              if (!taskMap[event.id]) {
                taskMap[event.id] = new Task();
                tasks.push(taskMap[event.id]);
              }

              if (!taskMap[event.id].updateNode(node, timeDeltas[i])) {
                taskMap[event.id] = undefined;
                i--;
              };
            }
          }
        }
        // if (event.name === 'FunctionCall'
        //   && event.duration && event.duration > Config.functionTimeout
        //   && event.args && event.args.data) {
        //   let { url, lineNumber, columnNumber } = event.args.data;
        //   if (url && lineNumber >= 0 && columnNumber >= 0) {
        //     key = `${url}:${lineNumber}:${columnNumber}`;

        //     location = <LocationOfCode>{
        //       url, line: lineNumber, column: columnNumber, during: event.duration
        //     }
        //     if (!timeoutCodeMap[key]) {
        //       timeoutCodeMap[key] = location;
        //     }

        //     if (timeoutCodeMap[key].during < location.during) {
        //       timeoutCodeMap[key].during = location.during;
        //     }
        //   }
        // }
      }
    }
  }

  for (let t of tasks) {
    t.calculateTime();
    if (t.top) {
      if (t.top.totalTime / 1000.0 > 200) {
        //console.log(['task : ', t.top.key(), JSON.stringify(t.top.callFrame), ' -- ', t.top.totalTime / 1000.0].join(''));
        // t.toTree();
      }
    } else {
      //console.log('task : top is empty');
    }
  }
  // for (let key of Object.keys(idToNode)) {
  //   if (idToNode[key].parent) {
  //console.log(idToNode[key].id, idToNode[key].name, idToNode[key].parent.id)
  //   } else {
  //console.log(idToNode[key].id, idToNode[key].name);
  //   }
  // }
  //console.log(tasks.length);
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
