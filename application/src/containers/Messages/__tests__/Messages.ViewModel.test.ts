import { GLOBAL_KEYS } from '@/store/constants';
import { MessagesViewModel } from '../Messages.ViewModel';
import storeManager from '../../../store/index';

jest.mock('../../../store/index');

describe('Message view model', () => {
  let vm: MessagesViewModel;
  let gs: { get: Function; set: Function };

  beforeEach(() => {
    jest.resetAllMocks();
    vm = new MessagesViewModel();
    gs = {
      get: jest.fn(),
      set: jest.fn(),
    };
    jest.spyOn(storeManager, 'getGlobalStore').mockReturnValue(gs);
  });

  it('should always update the global state and routes when redirect to conversation', () => {
    vm.updateCurrentConversationId(100);
    expect(gs.set).toHaveBeenCalledWith(
      GLOBAL_KEYS.CURRENT_CONVERSATION_ID,
      100,
    );
  });
});
