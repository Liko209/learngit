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

  waitUntilReachable(host: string = 'github.com', port: number = 443, maxRetry: number = 5, interval: number = 5) {
    for (let i = 0; i < maxRetry; i++) {
      const isReachable = (0 === shell.exec(`nc -z ${host} ${port}`).code);
      if (isReachable)
        return;
      shell.exec(`sleep ${interval}`);
    }
    throw new Error('Network is unreachable!');
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