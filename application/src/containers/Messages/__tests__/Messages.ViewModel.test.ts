import { MessagesViewModel } from '../Messages.ViewModel';
import storeManager from '../../../store/index';
jest.mock('../../../store/index');
describe('Message view model', () => {
  let vm;
  let gs;
  let history;
  beforeEach(() => {
    jest.resetAllMocks();
    vm = new MessagesViewModel();
    gs = {
      set: jest.fn(),
      get: jest.fn(),
    };
    jest.spyOn(storeManager, 'getGlobalStore').mockReturnValue(gs);
    history = {
      push: jest.fn(),
    };
  });
  it('should always update the global state and routes when redirect to conversation', () => {
    vm.toConversation('100', history);
    expect(storeManager.getGlobalStore).toBeCalled();
    expect(gs.set).toBeCalledWith('currentConversationId', 100);
    expect(history.push).toBeCalledWith('/messages/100');
  });
});
