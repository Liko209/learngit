// import { daoManager } from 'dao';
// import notificationCenter from 'service/notificationCenter';
import { transform, baseHandleData } from '../../../service/utils';
import handleData from '../handleData';
import { rawPersonFactory } from '../../../__tests__/factories';

jest.mock('../../../service/notificationCenter', () => ({
  emitEntityUpdate: jest.fn(),
}));

jest.mock('../../../dao', () => ({
  daoManager: {
    getDao: jest.fn(),
  },
}));

jest.mock('../../../service/utils', () => ({
  transform: jest.fn(),
  baseHandleData: jest.fn(),
}));

describe('handleData()', () => {
  it('empty array', async () => {
    await handleData([]);
    expect(transform).toHaveBeenCalledTimes(0);
    expect(baseHandleData).not.toHaveBeenCalled();
  });

  it('pass params type error', async () => {
    await handleData([rawPersonFactory.build({ _id: 1 })]);
    expect(transform).toHaveBeenCalledTimes(1);
    expect(baseHandleData).toHaveBeenCalled();
  });
});
