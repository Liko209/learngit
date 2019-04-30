/*
 * @Author: doyle.wu
 * @Date: 2019-03-27 10:31:20
 */
import * as fs from 'fs';
import { HeapSnapshot } from './heapSnapshot';

class HeapNode {
  id: number;
  name: string;
  distance: number;
  shallowSize: number;
  retainedSize: number;
}

const needCollect = (className: string): boolean => {
  return className.endsWith('Component')
    || className.endsWith('Consumer')
    || className.endsWith('Listener')
    || className.endsWith('Decorator')
    || className.endsWith('ViewModel')
    || className.endsWith('Controller')
    || className.endsWith('Service')
    || className.endsWith('FSStream')
    || className.endsWith('Manager')
    || className.indexOf('Telephony') > -1
}

const parseMemorySnapshot = (filePath: string): { [key: string]: Array<HeapNode> } => {
  if (!fs.existsSync(filePath)) {
    return undefined;
  }

  let content = fs.readFileSync(filePath, 'utf-8');

  let data;
  try {
    data = JSON.parse(content);
  } catch (err) {
    return undefined;
  }

  content = undefined;

  let snapshot = new HeapSnapshot(data);
  const node = snapshot.rootNode();

  const nodes = snapshot.nodes;
  const nodeFieldCount = snapshot.nodeFieldCount;

  let res: { [key: string]: Array<HeapNode> } = {};
  for (let idx = 0; idx < nodes.length; idx += nodeFieldCount) {
    node.nodeIndex = idx;

    if (node.type() === 'object' && needCollect(node.className())) {
      if (!res[node.className()]) {
        res[node.className()] = [];
      }

      res[node.className()].push({
        id: node.id(),
        name: node.className(),
        distance: node.distance(),
        shallowSize: node.selfSize(),
        retainedSize: node.retainedSize()
      })
    }
  }

  for (let key of Object.keys(snapshot)) {
    delete snapshot[key];
  }

  snapshot = undefined;

  return res;
}

export {
  parseMemorySnapshot,
  HeapNode
}
