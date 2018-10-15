import 'testcafe';

import { DataHelper } from './data-helper'
import { SdkHelper } from "./sdk-helper";
import { JupiterHelper } from "./jupiter-helper";

class Helper {
  constructor(private t: TestController) {};

  get dataHelper(): DataHelper {
    return new DataHelper(this.t);
  }

  get sdkHelper(): SdkHelper {
    return new SdkHelper(this.t);
  }

  get jupiterHelper(): JupiterHelper {
    return new JupiterHelper(this.t);
  }

  /* delegate following method */
  get rcData() {
    return this.dataHelper.rcData;
  }
}

function h(t: TestController) {
  return new Helper(t);
}

export {Helper, h};
