import 'testcafe'
import * as attestCheck from 'attest-testcafe';

export class A11yHelper {

  constructor(private t: TestController) {
  }

  async attestCheck(ruleSet: string = 'wcag2') {
    return await attestCheck(this.t, ruleSet);
  }
}
