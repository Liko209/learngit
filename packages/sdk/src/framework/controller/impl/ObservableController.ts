/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-04-10 14:38:06
 * Copyright © RingCentral. All rights reserved.
 */

import { IObservableController } from '../interface/IObservableController';

class ObservableController<T> implements IObservableController<T> {
  protected _observers: T[] = [];

  addObserver(observer: T) {
    this._observers.push(observer);
  }

  removeObserver(observer: T) {
    this._observers = this._observers.filter((value: T) => {
      return observer !== value;
    });
  }

  notifyObserver4Changes(notifyFunc: (observer: T) => void) {
    this._observers.forEach(ob => {
      notifyFunc(ob);
    });
  }
}

export { ObservableController };
