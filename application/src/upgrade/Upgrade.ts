/*
 * @Author: steven.zhuang
 * @Date: 2018-11-22 19:22:43
 * Copyright © RingCentral. All rights reserved.
 */

const logTag = '[Upgrade]';

class Upgrade {
  public queryInterval = 60 * 1000;
  private _hasNewVersion: boolean = false;
  private _queryHandler: VoidFunction;

  constructor() {
    setInterval(this._queryIfHasNewVersion.bind(this), this.queryInterval);
  }

  public setQueryHandler(handler: VoidFunction) {
    this._queryHandler = handler;
  }

  public onNewContentAvailable() {
    console.log(`${logTag} onNewContentAvailable`);
    this._hasNewVersion = true;
  }

  public upgradeIfAvailable() {
    if (this._hasNewVersion && this._canDoReload()) {
      console.log(`${logTag} Will auto reload due to new version is detected`);

      window.location.reload();
    }
  }

  private _canDoReload() {
    // TO-DO in future, disallow reload when there is any call or meeting.
    return true;
  }

  private _queryIfHasNewVersion() {
    console.log(`${logTag} _queryIfHasNewVersion`);
    if (this._queryHandler) {
      this._queryHandler();
    }
  }
}

const upgradeHandler = new Upgrade();
export { upgradeHandler, Upgrade };
