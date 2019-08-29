import { ElectronService } from '../service/ElectronService';
import { testable, test } from 'shield';

describe('ElectronService', () => {
  let electronServiceVM: ElectronService;

  @testable
  class openWindow {
    @test('should call openWindow if called')
    t1() {
      Object.defineProperty(window, 'jupiterElectron', {
        writable: true,
        value: {
          openWindow: jest.fn(),
        }
      })
      electronServiceVM = new ElectronService();
      electronServiceVM.openWindow('');
      expect(window.jupiterElectron.openWindow).toHaveBeenCalled();
    }

    @test('should not call openWindow if called')
    t2() {
      expect(window.jupiterElectron.openWindow).not.toHaveBeenCalled();
    }
  }

  @testable
  class setBadgeCount {
    @test('should call setBadgeCount if called')
    t1() {
      Object.defineProperty(window, 'jupiterElectron', {
        writable: true,
        value: {
          setBadgeCount: jest.fn(),
        }
      })
      electronServiceVM = new ElectronService();
      electronServiceVM.setBadgeCount(0);
      expect(window.jupiterElectron.setBadgeCount).toHaveBeenCalled();
    }

    @test('should not call setBadgeCount if called')
    t2() {
      expect(window.jupiterElectron.setBadgeCount).not.toHaveBeenCalled();
    }
  }

  @testable
  class bringAppToFront {
    @test('should call bringAppToFront if called')
    t1() {
      Object.defineProperty(window, 'jupiterElectron', {
        writable: true,
        value: {
          bringAppToFront: jest.fn()
        }
      })
      electronServiceVM = new ElectronService();
      electronServiceVM.bringAppToFront();
      expect(window.jupiterElectron.bringAppToFront).toHaveBeenCalled();
    }

    @test('should not call bringAppToFront if called')
    t2() {
      expect(window.jupiterElectron.bringAppToFront).not.toHaveBeenCalled();
    }
  }

  @testable
  class isURLSchemeBound {
    @test('should be truthy if isSchemeBound is not exist')
    t1() {
      Object.defineProperty(window, 'jupiterElectron', {
        writable: true,
        value: {
          isSchemeBound: '123123'
        }
      })
      electronServiceVM = new ElectronService();
      expect(electronServiceVM.isURLSchemeBound('')).toBeTruthy();
    }

  }
})
