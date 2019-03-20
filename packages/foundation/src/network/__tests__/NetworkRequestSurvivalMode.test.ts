import NetworkRequestSurvivalMode from '../NetworkRequestSurvivalMode';
import { SURVIVAL_MODE } from '../network';

describe('NetworkRequestSurvivalMode', () => {
  const mockCheckServerStatus = jest.fn();
  let mode: NetworkRequestSurvivalMode;
  beforeEach(() => {
    mode = new NetworkRequestSurvivalMode(mockCheckServerStatus);
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  describe('isSurvivalMode', () => {
    it('should not be survival mode by default', () => {
      expect(mode.isSurvivalMode()).toBeFalsy();
    });

    it('should not be survival mode', () => {
      mode['_survivalMode'] = SURVIVAL_MODE.SURVIVAL;
      expect(mode.isSurvivalMode()).toBeTruthy();
    });
  });

  describe('setSurvivalMode', () => {
    it('should change mode and setupTime', () => {
      const spy = jest.spyOn(mode, 'setupTimer');
      mode.setSurvivalMode(SURVIVAL_MODE.SURVIVAL, 10);
      expect(mode['_survivalMode']).toEqual(SURVIVAL_MODE.SURVIVAL);
      expect(spy).toBeCalled();
      expect(mode['_timer']).not.toBeNull();
    });
  });

  describe('setupTimer', () => {
    it('should cleared timer', () => {
      mode.setupTimer(60);
      expect(setTimeout).toBeCalled();
    });
  });

  describe('clearTimer', () => {
    it('should cleared timer', () => {
      mode.setupTimer(60);
      mode.clearTimer();
      expect(clearTimeout).toBeCalled();
    });
  });

  describe('backToNormal', () => {
    it('should call clearTimer and back to normal', () => {
      const spy = jest.spyOn(mode, 'clearTimer');
      mode.backToNormal();
      expect(mode['_survivalMode']).toEqual(SURVIVAL_MODE.NORMAL);
      expect(spy).toBeCalled();
    });
  });

  describe('healthChecking', () => {
    it('should back to normal when success', () => {
      mode['_checkServerStatus'] = callback => {
        callback(true, 0);
      };
      mode['_survivalMode'] = SURVIVAL_MODE.OFFLINE;
      jest.spyOn(mode, 'backToNormal');
      mode.healthChecking();
      expect(mode.backToNormal).toBeCalled();
      expect(mode['_survivalMode']).toEqual(SURVIVAL_MODE.NORMAL);
    });

    it('should set timer when failed', () => {
      mode['_checkServerStatus'] = callback => {
        callback(false, 30);
      };
      mode['_survivalMode'] = SURVIVAL_MODE.OFFLINE;
      jest.spyOn(mode, 'setupTimer');
      mode.healthChecking();
      expect(mode.setupTimer).toBeCalledWith(30000);
      expect(mode['_survivalMode']).toEqual(SURVIVAL_MODE.OFFLINE);
    });
  });
});
