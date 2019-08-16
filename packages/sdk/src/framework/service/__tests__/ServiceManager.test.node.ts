/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-06-24 17:14:41
 * Copyright © RingCentral. All rights reserved
 */
// / <reference path="../../../__tests__/types.d.ts" />
import { Container } from 'foundation/ioc';
import TestService from '../../__mocks__/services/TestService';
import { ServiceManager } from '..';

jest.mock('../AbstractService');

describe('ServiceManager', () => {
  let serviceManager: ServiceManager;
  let testService: TestService;

  beforeEach(() => {
    const container = new Container({ singleton: true });

    container.registerClass({
      name: TestService.name,
      value: TestService,
    });

    serviceManager = new ServiceManager(container);
    testService = container.get<TestService>(TestService.name);
  });

  describe('startService()', () => {
    it('should start service', () => {
      serviceManager.startService(TestService.name);
      expect(testService.start).toHaveBeenCalled();
    });

    it('should do nothing when trying to start a already started service', () => {
      testService.isStarted.mockReturnValue(true);
      serviceManager.startService(TestService.name);
      expect(testService.start).not.toHaveBeenCalled();
    });
  });

  describe('startServices()', () => {
    it('should start services', () => {
      serviceManager.startServices([TestService.name]);
      expect(testService.start).toHaveBeenCalled();
    });
  });

  describe('stopService()', () => {
    it('should stop the service', () => {
      serviceManager.startService(TestService.name);
      serviceManager.stopService(TestService.name);
      expect(testService.stop).toHaveBeenCalled();
    });

    it('should do nothing when trying to stop a no existed service', () => {
      serviceManager.stopService('NoExistedService');
      expect(testService.stop).not.toHaveBeenCalled();
    });
  });

  describe('stopServices()', () => {
    it('should stop services', () => {
      serviceManager.startService(TestService.name);
      serviceManager.stopServices([TestService.name]);
      expect(testService.stop).toHaveBeenCalled();
    });
  });

  describe('stopAllServices()', () => {
    it('should stop all service', () => {
      serviceManager.startService(TestService.name);
      serviceManager.stopAllServices();
      expect(testService.stop).toHaveBeenCalled();
    });
  });

  describe('getServices()', () => {
    it('should return the wanted services', () => {
      serviceManager.startService(TestService.name);
      const services = serviceManager.getServices([TestService.name]);
      expect(services[0]).toBeInstanceOf(TestService);
    });

    it('should return [] if no wanted services is running', () => {
      serviceManager.startService(TestService.name);
      const services = serviceManager.getServices(['NoExistedService']);
      expect(services).toHaveLength(0);
    });
  });

  describe('getAllServices()', () => {
    it('should return all running services', () => {
      serviceManager.startService(TestService.name);
      const services = serviceManager.getAllServices();
      expect(services).toHaveLength(1);
    });

    it('should return [] if no service is running', () => {
      const services = serviceManager.getAllServices();
      expect(services).toHaveLength(0);
    });
  });
});
