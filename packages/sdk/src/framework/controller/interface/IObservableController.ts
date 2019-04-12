/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-04-10 14:33:50
 * Copyright © RingCentral. All rights reserved.
 */

interface IObservableController<T> {
  addObserver(observer: T): void;
  removeObserver(observer: T): void;
  notifyObserver4Changes(notifyFunc: (observer: T) => void): void;
}

export { IObservableController };
