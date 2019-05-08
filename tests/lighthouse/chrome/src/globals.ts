import { Config } from "./config";

/*
 * @Author: doyle.wu
 * @Date: 2019-05-07 17:45:59
 */
class GlobalWrapper {
  private _collectProcessInfo = false;
  private _memoryFileArray = [];

  public startCollectProcessInfo() {
    this._collectProcessInfo = true;
  }

  public stopCollectProcessInfo() {
    this._collectProcessInfo = false;
  }

  public collectProcessInfo(): boolean {
    return this._collectProcessInfo;;
  }

  public pushMemoryFilePath(filePath: string) {
    if (Config.takeHeapSnapshot) {
      this._memoryFileArray.push(filePath);
    }
  }

  public clearMemoryFiles() {
    this._memoryFileArray = [];
  }

  public getMemoryFiles(): Array<string> {
    return [...this._memoryFileArray];
  }
}

const globals = new GlobalWrapper();

export {
  globals
}
