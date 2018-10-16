import { MessagesViewModel } from '../Messages.ViewModel';
import storeManager from '../../../store/index';
import { match } from 'react-router';

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
    vm.props.match = { params: { id: '200' } } as match<{ id: string }>;
    vm.updateCurrentConversationId();
    expect(gs.set).toHaveBeenCalledWith('currentConversationId', 200);
  });
});
