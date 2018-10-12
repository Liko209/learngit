import 'testcafe';

import { DataHelper } from './data-helper'
import { SdkHelper } from "./sdk-helper";

class Helper {
  constructor(private t: TestController) {};

  get dataHelper(): DataHelper {
    return new DataHelper(this.t);
  }

  get sdkHelper(): SdkHelper {
    return new SdkHelper(this.t);
  }
}

function h(t: TestController) {
  return new Helper(t);
}

export {Helper, h};
