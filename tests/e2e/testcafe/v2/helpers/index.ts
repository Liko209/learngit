import 'testcafe';

import { DataHelper } from './data-helper'


class Helper {
  constructor(private t: TestController) {};

  get dataHelper(): DataHelper {
    return new DataHelper(this.t);
  }

}

function h(t: TestController) {
  return new Helper(t);
}

export {Helper, h};
