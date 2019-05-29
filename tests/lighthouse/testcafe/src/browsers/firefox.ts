/*
 * @Author: doyle.wu
 * @Date: 2019-05-23 08:51:30
 */
import { Browser } from './browser';

class Firefox extends Browser {

  constructor(t: TestController) {
    super(t);
  }

  get name(): string {
    return "Firefox";
  }
}

export {
  Firefox
}
