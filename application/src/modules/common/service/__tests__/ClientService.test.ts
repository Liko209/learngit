import { container } from 'framework/ioc';
import { ClientService } from '../ClientService';
import { ElectronService } from '@/modules/electron';

describe('ClientService', () => {
  let portal: any;
  describe('invokeApp', () => {
    const setAttribute = jest.fn();
    const reset = () => {
      jest.spyOn(container, 'get').mockReturnValue({
        isURLSchemeBound: jest.fn().mockResolvedValue(true),
      });
      document.body.appendChild = el => (portal = el);
      document.getElementById = () => portal;
      jest.spyOn(document, 'createElement').mockReturnValue({
        style: {},
        setAttribute,
      });
    };
    beforeAll(() => {
      reset();
    });
    beforeEach(() => {
      portal = null;
      jest.clearAllMocks();
    });
    it('should set src of the iframe when current is in browser context', async () => {
      const service = new ClientService();
      await await service.invokeApp('rcmobile://', { fallback: jest.fn() });
      expect(setAttribute).toHaveBeenCalled();
    });
    it('should set src of the iframe again when invoked twice in browser context', async () => {
      const service = new ClientService();
      await service.invokeApp('rcmobile://', { fallback: jest.fn() });
      await service.invokeApp('rcmobile://', { fallback: jest.fn() });
      expect(setAttribute).toHaveBeenCalledTimes(2);
      expect(document.createElement).toHaveBeenCalledTimes(1);
    });
    it('should set src of the iframe again and call electron service twice when invoked twice in electron context', async () => {
      window.jupiterElectron = {};
      const service = new ClientService();
      await service.invokeApp('rcmobile://', { fallback: jest.fn() });
      await service.invokeApp('rcmobile://', { fallback: jest.fn() });
      expect(setAttribute).toHaveBeenCalledTimes(2);
      expect(document.createElement).toHaveBeenCalledTimes(1);
      const electronService: ElectronService = container.get('electron');
      expect(electronService.isURLSchemeBound).toHaveBeenCalledTimes(2);
      window.jupiterElectron = null;
    });
    it('should call fallback if app is not installed in electron context', async () => {
      jest.spyOn(container, 'get').mockReturnValue({
        isURLSchemeBound: jest.fn().mockResolvedValueOnce(false),
      });
      window.jupiterElectron = {};
      const fallback = jest.fn();
      const service = new ClientService();
      await service.invokeApp('rcmobile://', { fallback });
      await service.invokeApp('rcmobile://', { fallback });
      expect(setAttribute).not.toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledTimes(1);
      const electronService: ElectronService = container.get('electron');
      expect(electronService.isURLSchemeBound).toHaveBeenCalledTimes(2);
      expect(fallback).toHaveBeenCalledTimes(2);
      window.jupiterElectron = null;
    });
  });
});
