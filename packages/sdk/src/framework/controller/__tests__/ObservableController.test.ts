/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-04-10 15:50:28
 * Copyright © RingCentral. All rights reserved.
 */
import { ObservableController } from '../impl/ObservableController';

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}
class Observer {
  notify() {}
}
describe('ObservableController', () => {
  let observableController: ObservableController<Observer>;
  function setUp() {
    observableController = new ObservableController();
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('notifyObserver4Changes', () => {
    const observer = new Observer();
    const entities = [{ id: 1 }, { id: 2 }, { id: 3 }];
    beforeEach(() => {
      clearMocks();
      observer.notify = jest.fn();
    });

    it('it should notify changes', () => {
      observableController.addObserver(observer);
      observableController.notifyObserver4Changes((ob: Observer) => {
        ob.notify();
      });
      expect(observer.notify).toHaveBeenCalled();
    });
  });

  describe('removeObserver', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should remove observer in the controller', () => {
      const observer = new Observer();

      observableController['_observers'] = [observer];
      expect(observableController['_observers']).toHaveLength(1);
      observableController.removeObserver(observer);
      expect(observableController['_observers']).toHaveLength(0);
    });

    it('should not remove observer in the controller when observer is different', () => {
      const observer = new Observer();
      const observer2 = new Observer();

      observableController['_observers'] = [observer];
      expect(observableController['_observers']).toHaveLength(1);
      observableController.removeObserver(observer2);
      expect(observableController['_observers']).toHaveLength(1);
    });
  });

  describe('addObserver', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });
    it('it should add observer to observer array in the controller', () => {
      const observer = new Observer();

      expect(observableController['_observers']).toHaveLength(0);
      observableController.addObserver(observer);
      expect(observableController['_observers']).toHaveLength(1);
    });
  });
});
