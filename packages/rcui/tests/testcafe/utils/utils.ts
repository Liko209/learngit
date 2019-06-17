import * as fs from 'fs';
import {MakeDirectoryOptions} from 'fs';


export class MiscUtils {

  static jsonDump(path: string, object: any) {
    const content = JSON.stringify(object, null, 2);
    fs.writeFileSync(path, content);
  }

  static createDirIfNotExists(path: string, options?: number | string | MakeDirectoryOptions | null) {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, options)
    }
  }
}
