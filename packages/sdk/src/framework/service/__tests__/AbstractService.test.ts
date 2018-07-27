/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-06-24 17:14:41
 * Copyright © RingCentral. All rights reserved
*/
/// <reference path="../../../__tests__/types.d.ts" />
import { AbstractService } from '../AbstractService';

class MyService extends AbstractService {
  onStarted(): void {}
  onStopped(): void {}
}
MyService.prototype.onStarted = jest.fn();
MyService.prototype.onStopped = jest.fn();

describe('AbstractService', () => {
  describe('start()', () => {
    it('should trigger onStarted', () => {
      const service = new MyService();
      service.start();
      expect(service.onStarted).toHaveBeenCalled();
    });
  });

  describe('stop()', () => {
    it('should trigger onStopped', () => {
      const service = new MyService();
      service.stop();
      expect(service.onStopped).toHaveBeenCalled();
    });
  });

  describe('isStarted()', () => {
    it('should return service status', () => {
      const service = new MyService();
      expect(service.isStarted()).toBeFalsy();
    });
  });
});
