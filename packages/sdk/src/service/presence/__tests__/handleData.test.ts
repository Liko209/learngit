import serviceManager from '../../../service/serviceManager';
import PresenceService from '../../../service/presence/index';
import handleData from '../handleData';

jest.mock('service/serviceManager', () => {
  const instance = { saveToMemory: jest.fn() };
  return {
    getInstance: () => instance
  };
});

jest.mock('service/presence/index', () => {
  const instance = { saveToMemory: jest.fn() };
  return {
    getInstance: () => instance
  };
});

describe('presence handleData', () => {
  it('passing an empty array', async () => {
    const result = await handleData([]);
    expect(result).toBeUndefined();
  });

  it('passing an array', async () => {
    await handleData([{ person_id: 1, presence: 'online' }]);
    const instance = serviceManager.getInstance(PresenceService);
    expect(instance.saveToMemory).toHaveBeenCalled();
  });
});
