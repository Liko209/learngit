/*
 * @Author: doyle.wu
 * @Date: 2019-07-17 15:21:07
 */

class Node {
  id: number;
  eventId: string;
  name: string;
  url: string;
  scriptId: number;
  lineNumber: number;
  columnNumber: number;
  callFrame: any;
  parent: Node;
  children: { [key: number]: Node };
  selfTime: number;
  totalTime: number;
  _isAnoymous: boolean;

  constructor(eventId: string, id: number, callFrame: any) {
    this.id = id;
    this.eventId = eventId;
    this.callFrame = callFrame;
    this.name = callFrame.functionName;
    this.url = callFrame.url;
    this.scriptId = callFrame.scriptId;
    this.lineNumber = callFrame.lineNumber;
    this.columnNumber = callFrame.columnNumber;

    if (!this.name || this.name === '') {
      this.name = '(anoymous)';
      this._isAnoymous = true;
    } else {
      this._isAnoymous = false;
    }

    this.selfTime = 0;
    this.totalTime = 0;

    this.children = {};
  }

  key(): string {
    // let scriptId = this.scriptId || 0;
    // let line = this.lineNumber || 0;
    // let column = this.columnNumber || 0;

    return [this.eventId, this.id].join('_');
  }

  isTop(): boolean {
    return !this.isSystem() && (!this.parent || this.parent.isRoot());
  }

  isSystem(): boolean {
    return this.isRoot() || this.isProgram() || this.isIdle() || this.isGC();
  }

  isRoot(): boolean {
    return this.name === '(root)';
  }

  isProgram(): boolean {
    return this.name === '(program)';
  }

  isGC(): boolean {
    return this.name === '(garbage collector)';
  }

  isIdle(): boolean {
    return this.name === '(idle)';
  }

  isAnoymous(): boolean {
    return this._isAnoymous;
  }
}

export {
  Node
}
