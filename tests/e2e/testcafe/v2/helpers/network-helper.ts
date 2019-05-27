import 'testcafe';
import * as shell from 'shelljs';

class NetworkHelper {

  constructor(
    private t: TestController,
  ) { }

  isSupported() {
    return !!shell.which('nmcli');
  }

  setNetwork(on: boolean, suppressError: boolean = true) {
    if (on) {
      shell.exec(`nmcli networking on || ${suppressError}`);
    } else {
      shell.exec(`nmcli networking off || ${suppressError}`);
    }
  }

  async withNetworkOff(cb: () => Promise<any>) {
    if (this.isSupported()) {
      throw new Error("cannot find command: nmcli")
    }
    try {
      this.setNetwork(false, false);
      await cb();
    } finally {
      this.setNetwork(true, false);
    }
  }
}

export { NetworkHelper };