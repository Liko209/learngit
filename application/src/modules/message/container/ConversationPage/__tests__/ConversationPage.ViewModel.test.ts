import { ConversationPageViewModel } from '../ConversationPage.ViewModel';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import _ from 'lodash';
const groupId = Math.random();
describe('ConversationPage.ViewModel', () => {
  const mockedSyncLastGroupId = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(ServiceLoader, 'getInstance').mockReturnValue({
      getById: jest.fn().mockResolvedValue({}),
      isValid: jest.fn().mockResolvedValue(true),
      updateLastGroup: mockedSyncLastGroupId,
    });
    _.wrap = (a: any) => a;
    _.throttle = (a: any) => a;
  });
  describe('constructor()', () => {
    it('should record last group when conversation page is mounted', (done) => {
      const props = {
        groupId,
      };
      const vm = new ConversationPageViewModel(props);
      jest.clearAllTimers();

      setTimeout(() => {
        expect(mockedSyncLastGroupId).toBeCalledTimes(1);
        done();
      },         0);
    });
  });
});
