import NetworkRequestSurvivalMode from '../NetworkRequestSurvivalMode';
import { SURVIVAL_MODE } from '../network';

const mode = new NetworkRequestSurvivalMode();
jest.useFakeTimers();

describe('NetworkRequestSurvivalMode', () => {
  describe('canSupportSurvivalMode', () => {
    it('should support uri in SURVIVAL_MODE_URIS', () => {
      mode.survivalModeURIs = { a: 'test' };
      expect(mode.canSupportSurvivalMode('test')).toBeTruthy();
    });
  });

  describe('isSurvivalMode', () => {
    it('normal is survival mode', () => {
      expect(mode.isSurvivalMode()).toBeFalsy();
    });
  });

  describe('setSurvivalMode', () => {
    it('should change mode and setupTime', () => {
      const spy = jest.spyOn(mode, 'setupTimer');
      mode.setSurvivalMode(SURVIVAL_MODE.SURVIVAL, 10);
      expect(mode.survivalMode).toEqual(SURVIVAL_MODE.SURVIVAL);
      expect(spy).toBeCalled();
      expect(mode.timer).not.toBeNull();
    });
  });

  describe('clearTimer', () => {
    it('should cleared timer', () => {
      mode.clearTimer();
      expect(setTimeout).toBeCalled();
    });
  });
  describe('backToNormal', () => {
    it('should call clearTimer and back to normal', () => {
      const spy = jest.spyOn(mode, 'setupTimer');
      mode.backToNormal();
      expect(mode.survivalMode).toEqual(SURVIVAL_MODE.NORMAL);
      expect(spy).toBeCalled();
    });
  });
});
