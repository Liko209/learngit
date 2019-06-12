/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-06-04 11:21:27
 * Copyright © RingCentral. All rights reserved.
 */

type ToggleRequest = {
  value: boolean;
  func: () => void;
};

class ToggleController {
  private _isDoing: boolean = false;
  private _requests: ToggleRequest[] = [];

  do(request: ToggleRequest) {
    if (this._isDoing) {
      let result = 0;
      this._requests.push(request);
      this._requests.forEach(item => {
        if (item.value) {
          result += 1;
        } else {
          result -= 1;
        }
      });
      if (result === 0) {
        this._requests.splice(0, this._requests.length);
      }
    } else {
      request.func();
      this._isDoing = true;
    }
  }

  onSuccess() {
    if (this._requests.length) {
      const request = this._requests.splice(0, 1)[0];
      request.func();
    } else {
      this._isDoing = false;
    }
  }

  onFailure() {
    this._isDoing = false;
    if (this._requests.length) {
      this._requests.splice(0, this._requests.length);
    }
  }
}

export { ToggleController, ToggleRequest };
