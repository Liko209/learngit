import { CommonModule } from '../CommonModule';
import { globalKeysManager } from '@/modules/app/globalKeyManager';
import { switchConversationHandler } from '@/modules/common/container/GroupSearch/switchConversationHandler';
import { GLOBAL_HOT_KEYS } from '@/modules/app/globalKeys.config';

describe('common module', () => {
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
  });
});
