/*
 * @Author: doyle.wu
 * @Date: 2019-07-17 15:40:38
 */
import { Node } from './node';

class Task {
  top: Node;
  nodes: { [key: number]: Node };

  addNode(node: Node, delta: number) {
    if (!this.nodes[node.id]) {
      this.nodes[node.id] = Node.copy(node);
    }

    if (!this.top && node.isTop()) {
      this.top = this.nodes[node.id];
    }

    this.nodes[node.id].selfTime += delta;
  }

  calculateTime(): void {

  }
}

export {
  Task
}
