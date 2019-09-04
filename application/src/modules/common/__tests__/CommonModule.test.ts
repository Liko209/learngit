import { CommonModule } from '../CommonModule';
import { globalKeysManager } from '@/modules/app/globalKeyManager';
import { switchConversationHandler } from '@/modules/common/container/GroupSearch/switchConversationHandler';
import { GLOBAL_HOT_KEYS } from '@/modules/app/globalKeys.config';
import { Jupiter } from 'framework/Jupiter';
import { FeaturesFlagsService } from '../../featuresFlags/service';
import { container } from 'framework/ioc';

// jest.mock('../../featuresFlags/service',)
// FeaturesFlagsService.prototype.canUseMessage = () => false;
const jupiter = container.get(Jupiter);
jupiter.registerClass(FeaturesFlagsService);

describe('common module', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });
  describe('bootstrap()', () => {
    it('should call globalKeysManager.addGlobalKey with correct argument', () => {
      jest
        .spyOn(globalKeysManager, 'addGlobalKey')
        .mockImplementation(jest.fn());

      const commonModule = new CommonModule();
      commonModule.bootstrap();
      expect(globalKeysManager.addGlobalKey).toHaveBeenCalledWith(
        GLOBAL_HOT_KEYS.SWITCH_CONVERSATION,
        switchConversationHandler,
      );
    });

    it.skip('should not register global key when feature flag not available', () => {
      const spy = jest
        .spyOn(globalKeysManager, 'addGlobalKey')
        .mockImplementation(jest.fn());
      const commonModule = new CommonModule();
      commonModule.bootstrap();
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
