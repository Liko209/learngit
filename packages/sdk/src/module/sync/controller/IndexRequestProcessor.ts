/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-03-20 13:12:28
 * Copyright © RingCentral. All rights reserved.
 */

import { IProcessor } from '../../../framework/processor/IProcessor';
import { getCurrentTime } from '../../../utils/jsUtils';

type IndexExecuteFuncType = () => Promise<void>;

class IndexRequestProcessor implements IProcessor {
  private _name: string;
  private _executeFunction: IndexExecuteFuncType;
  constructor(executeFun: IndexExecuteFuncType) {
    this._name = `index_${getCurrentTime()}`;
    this._executeFunction = executeFun;
  }
  async process(): Promise<boolean> {
    await this._executeFunction();
    return Promise.resolve(true);
  }
  canContinue(): boolean {
    return true;
  }
  name(): string {
    return this._name;
  }
}

export { IndexRequestProcessor };
