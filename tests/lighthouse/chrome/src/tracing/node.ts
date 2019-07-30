/*
 * @Author: doyle.wu
 * @Date: 2019-07-17 15:21:07
 */

class Node {
  id: number;
  name: string;
  parent: Node;
  selfTime: number;
  totalTime: number;
  children: { [key: number]: Node };

  _isAnoymous: boolean;

  constructor(id: number, name: string) {
    this.id = id;
    if (!name || name === '') {
      this.name = '(anoymous)';
      this._isAnoymous = true;
    } else {
      this.name = name;
      this._isAnoymous = false;
    }
    this.selfTime = 0;
    this.totalTime = 0;
    this.children = {};
  }

  static copy(node: Node): Node {
    let mirror = new Node(node.id, node.name);

    for (let key of Object.keys(node.children)) {
      mirror.children[key] = node.children[key];
    }

    return mirror;
  }

  isTop(): boolean {
    return !this.isSystem() && this.parent && this.parent.isRoot();
  }

  isSystem(): boolean {
    return this.isRoot() || this.isProgram() || this.isIdle() || this.isGC();
  }

  isRoot(): boolean {
    return this.name === '(idle)';
  }

  isProgram(): boolean {
    return this.name === '(program)';
  }

  isGC(): boolean {
    return this.name === '(garbage collector)';
  }

  isIdle(): boolean {
    return this.name === '(root)';
  }

  isAnoymous(): boolean {
    return this._isAnoymous;
  }
}

export {
  Node
}
