/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-04-09 21:01:48
 * Copyright © RingCentral. All rights reserved.
 */
import { EntityNotificationController } from '../impl/EntityNotificationController';
import { IdModel } from '../../model';
import { IEntityChangeObserver } from '../types';

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('EntityNotificationController', () => {
  let entityNotificationController: EntityNotificationController;

  function setUp() {
    entityNotificationController = new EntityNotificationController();
  }
  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('setFilterFunc', () => {
    beforeEach(() => {
      clearMocks();
    });

    it('should set new filter func to it self', () => {
      const filter = () => {
        return true;
      };
      entityNotificationController.setFilterFunc(filter);
      expect(entityNotificationController['_filterFunc']).toEqual(filter);
    });
  });

  describe('onReceivedNotification', () => {
    const observer = new class implements IEntityChangeObserver {
      onEntitiesChanged(entities: IdModel[]) {}
    }();
    const entities = [{ id: 1 }, { id: 2 }, { id: 3 }];
    beforeEach(() => {
      clearMocks();
      observer.onEntitiesChanged = jest.fn();
    });

    it('it should notify all changes when has no filter func ', () => {
      entityNotificationController = new EntityNotificationController();
      entityNotificationController.addObserver(observer);
      entityNotificationController.onReceivedNotification(entities);
      expect(observer.onEntitiesChanged).toBeCalledWith(entities);
    });

    it('it should notify changes filtered by filter func ', () => {
      const filterFunc = (entity: IdModel) => {
        return entity.id % 2 === 0;
      };
      entityNotificationController = new EntityNotificationController(
        filterFunc,
      );
      entityNotificationController.addObserver(observer);
      entityNotificationController.onReceivedNotification(entities);
      expect(observer.onEntitiesChanged).toBeCalledWith([entities[1]]);
    });
  });

  describe('removeObserver', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should remove observer in the controller', () => {
      const observer = new class implements IEntityChangeObserver {
        onEntitiesChanged(entities: IdModel[]) {}
        add() {}
      }();
      entityNotificationController['_observers'] = [observer];
      expect(entityNotificationController['_observers']).toHaveLength(1);
      entityNotificationController.removeObserver(observer);
      expect(entityNotificationController['_observers']).toHaveLength(0);
    });

    it('should not remove observer in the controller when observer is different', () => {
      const observer = new class implements IEntityChangeObserver {
        onEntitiesChanged(entities: IdModel[]) {}
        add() {}
      }();

      const observer2 = new class implements IEntityChangeObserver {
        onEntitiesChanged(entities: IdModel[]) {}
        add() {}
      }();
      entityNotificationController['_observers'] = [observer];
      expect(entityNotificationController['_observers']).toHaveLength(1);
      entityNotificationController.removeObserver(observer2);
      expect(entityNotificationController['_observers']).toHaveLength(1);
    });
  });

  describe('addObserver', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });
    it('it should add observer to observer array in the controller', () => {
      const observer = new class implements IEntityChangeObserver {
        onEntitiesChanged(entities: IdModel[]) {}
        add() {}
      }();

      expect(entityNotificationController['_observers']).toHaveLength(0);
      entityNotificationController.addObserver(observer);
      expect(entityNotificationController['_observers']).toHaveLength(1);
    });
  });
});
