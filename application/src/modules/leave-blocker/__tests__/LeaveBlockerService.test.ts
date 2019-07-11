import { LeaveBlockerService } from '../service';

describe('LeaveBlockerService', () => {
  let service;
  beforeEach(() => {
    service = new LeaveBlockerService();
  });
  describe('init()', () => {
    it('should set window.onbeforeunload to a function when being called', () => {
      expect(window.onbeforeunload).toBeNull();
      service.init();
      expect(window.onbeforeunload).not.toBeNull();
    });
  });
  describe('dispose()', () => {
    it('should set window.onbeforeunload to null when being called', () => {
      service.init();
      expect(window.onbeforeunload).not.toBeNull();
      service.dispose();
      expect(window.onbeforeunload).toBeNull();
    });
  });
  describe('onLeave()', () => {
    it('should push handler to this.handlers when being called', () => {
      service.init();
      expect(service.handlers).toHaveLength(0);
      service.onLeave(jest.fn());
      expect(service.handlers).toHaveLength(1);
    });
  });
  describe('onLeave()', () => {
    it('should remove handler from this.handlers when being called', () => {
      service.init();
      const handler = jest.fn();
      service.handlers.push(handler);
      expect(service.handlers).toHaveLength(1);
      service.offLeave(handler);
      expect(service.handlers).toHaveLength(0);
    });
  });
});
