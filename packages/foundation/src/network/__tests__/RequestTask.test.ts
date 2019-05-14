import RequestTask from '../RequestTask';
import { getFakeRequest } from './utils';
import { REQUEST_PRIORITY, REQUEST_WEIGHT } from '..';
const task = new RequestTask(getFakeRequest());
describe('RequestTask', () => {
  describe('setRequestPriority', () => {
    it('should change priority', () => {
      task.weight = REQUEST_WEIGHT.HIGH;
      task.setRequestPriority(REQUEST_PRIORITY.NORMAL);
      expect(task.priority()).toEqual(REQUEST_PRIORITY.NORMAL);
      expect(task.weight).toEqual(REQUEST_WEIGHT.HIGH);

      task.weight = REQUEST_WEIGHT.NORMAL;
      task.setRequestPriority(REQUEST_PRIORITY.HIGH);
      expect(task.priority()).toEqual(REQUEST_PRIORITY.HIGH);
      expect(task.weight).toEqual(REQUEST_WEIGHT.HIGH);

      task.weight = REQUEST_WEIGHT.NORMAL;
      task.setRequestPriority(REQUEST_PRIORITY.IMMEDIATE);
      expect(task.priority()).toEqual(REQUEST_PRIORITY.IMMEDIATE);
      expect(task.weight).toEqual(REQUEST_WEIGHT.HIGH);
    });
  });
});
