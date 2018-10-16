import 'testcafe';

import { DataHelper } from './data-helper'
import { SdkHelper } from "./sdk-helper";
import { JupiterHelper } from "./jupiter-helper";
import { A11yHelper } from "./a11y-helper";
import { LogHelper } from './log-helper';

import { IUser } from '../models';
import { UICreator } from '../../page-models';

class Helper {
  constructor(private t: TestController) {};

  get a11yHelper() {
    return new A11yHelper(this.t);
  }

  get dataHelper() {
    return new DataHelper(this.t);
  }

  get sdkHelper() {
    return new SdkHelper(this.t);
  }

  get jupiterHelper() {
    return new JupiterHelper(this.t);
  }

  get logHelper() {
    return new LogHelper(this.t);
  }

  /* delegate following method */
  get rcData() {
    return this.dataHelper.rcData;
  }

  directLoginWithUser(url: string, user: IUser) {
    return this.jupiterHelper.directLoginWithUser(url, user);
  }

  fromPage<T>(uiCreator: UICreator<T>) {
    return this.jupiterHelper.fromPage(uiCreator);
  }

}

function h(t: TestController) {
  return new Helper(t);
}

export { Helper, h };
