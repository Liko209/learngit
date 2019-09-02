/*
 * @Author: doyle.wu
 * @Date: 2019-07-17 15:40:38
 */
import { Node } from './node';
import { LogUtils } from '../utils';

const logger = LogUtils.getLogger(__filename);

class Task {
  top: Node;
  nodes: { [key: string]: Node };
  last: Node;
  isEnd: boolean;

  constructor() {
    this.nodes = {};
    this.isEnd = false;
  }

  updateNode(node: Node, delta: number): boolean {
    if (!this.nodes[node.key()]) {
      this.nodes[node.key()] = new Node(node.eventId, node.id, node.callFrame);
    }

    if (node.isTop()) {
      if (this.top && this.top.key() !== node.key()) {
        if (this.isEnd) {
          logger.warn(['top is exist. top : ', this.top.key(), ' new : ', node.key()].join(''));
        }
        this.isEnd = true;
        return false;
      } else {
        this.top = this.nodes[node.key()];
      }
    } else {
      let current = node, parent;
      while (current.parent) {
        parent = this.nodes[current.parent.key()];
        if (!parent) {
          parent = new Node(current.parent.eventId, current.parent.id, current.parent.callFrame);
          this.nodes[parent.key()] = parent;
        }

        parent.children[current.key()] = this.nodes[current.key()];
        this.nodes[current.key()].parent = parent;

        if (current.parent.isTop()) {
          if (this.top && this.top.key() !== parent.key()) {
            if (this.isEnd) {
              logger.warn(['[loop]top is exist. top : ', this.top.key(), ' new : ', parent.key()].join(''));
            }
            this.isEnd = true;
            return false;
          }
          this.top = parent;
          break;
        }

        current = current.parent;
      }
    }

    if (!this.top) {
      return false;
    }

    this.nodes[node.key()].selfTime += delta;
    this.last = this.nodes[node.key()];
    return true;
  }

  calculateTime(): void {
    if (!this.top) {
      return;
    }

    const stack: Array<Node> = [this.top];
    let node: Node, parent: Node;

    while (stack.length) {
      node = stack.pop();

      node.totalTime = node.selfTime;

      parent = node;
      while (parent && !parent.isTop()) {
        parent = parent.parent;
        if (parent) {
          parent.totalTime += node.selfTime;
        }
      }

      for (let key of Object.keys(node.children)) {
        stack.push(node.children[key]);
      }
    }
  }

  toTree(): void {
    let queue = [{ id: this.top.key(), parent: undefined, name: this.top.name, time: this.top.selfTime, level: 1 }];
    let item, node, curLevel = 0;
    while (queue.length) {
      item = queue.shift();

      if (curLevel != item.level) {
        //console.log(`${item.level} level:`);
        curLevel = item.level;
      }

      //console.log(`(${item.id}, ${item.parent}, ${item.name}, ${item.time})`);
      node = this.nodes[item.id];
      if (node.children) {
        for (let key of Object.keys(node.children)) {
          queue.push({
            id: node.children[key].key(),
            parent: item.id,
            name: node.children[key].name,
            time: node.children[key].selfTime,
            level: item.level + 1
          });
        }
      }

    }
  }
}

export {
  Task
}
