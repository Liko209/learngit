/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-03-07 09:04:06
 */
import { daoManager, StateDao } from '../../../dao';
import notificationCenter from '../../../service/notificationCenter';
import handleData, {
  transform,
  getStates,
  TransformedState,
  handlePartialData,
  handleGroupChange,
} from '../../../service/state/handleData';
import {
  sample,
  transformedGroupState,
  transformedMyState,
  sample2,
  partialSample,
} from './dummy';
import { rawMyStateFactory, groupFactory } from '../../../__tests__/factories';
import StateService from '..';

jest.mock('../../../dao', () => {
  const dao = {
    bulkUpdate: jest.fn(),
  };
  const kvDao = {
    put: jest.fn(),
  };

  return {
    daoManager: {
      getDao: jest.fn(() => dao),
      getKVDao: jest.fn(() => kvDao),
    },
  };
});

jest.mock('..', () => ({
  getInstance: jest.fn().mockReturnThis(),
  calculateUMI: jest.fn().mockImplementation(groupState => {
    return groupState;
  }),
}));
jest.mock('../../../service/notificationCenter', () => ({
  emitEntityUpdate: jest.fn(),
}));

describe('transform()', () => {
  let result: TransformedState;
  it('should transform _id to id', () => {
    result = transform(sample);
    expect(result).toMatchObject({
      id: sample._id,
    });
    expect(result).not.toHaveProperty('_id');
  });
  it('should have an array property away_status_history if not exists', () => {
    const myState = rawMyStateFactory.build({});
    delete myState.away_status_history;
    result = transform(myState);
    expect(result).toMatchObject({
      away_status_history: [],
    });
  });
  it('should extract groupStates', () => {
    result = transform(sample);
    expect(result).toHaveProperty('groupState', transformedGroupState);
  });
});

describe('getStates()', () => {
  let result;
  it('should return transformed state data', () => {
    result = getStates([sample]);
    expect(result).toHaveProperty('myState', [transformedMyState]);
    expect(result).toHaveProperty('groupStates', transformedGroupState);
  });
});

describe('stateHandleData()', () => {
  it('should return void if pass empty array', async () => {
    await expect(handleData([])).resolves.toBeUndefined();
    expect(notificationCenter.emitEntityUpdate).toHaveBeenCalledTimes(0);
    expect(daoManager.getDao(StateDao).bulkUpdate).toHaveBeenCalledTimes(0);
  });
  it('should save to db', async () => {
    await handleData([sample]);
    expect(notificationCenter.emitEntityUpdate).toHaveBeenCalledTimes(2);
    expect(daoManager.getDao(StateDao).bulkUpdate).toHaveBeenCalledTimes(2);
  });

  it('should run for partial data', async () => {
    await expect(handleData([sample2])).resolves;
  });
});
describe('handlePartialData', () => {
  it('should save to db if umi related metrics change', async () => {
    jest.clearAllMocks();
    await handlePartialData([partialSample]);
    expect(notificationCenter.emitEntityUpdate).toHaveBeenCalledTimes(2);
    expect(daoManager.getDao(StateDao).bulkUpdate).toHaveBeenCalledTimes(2);
  });
  it('should not save to db and update if empty state', async () => {
    jest.clearAllMocks();
    await handlePartialData([]);
    expect(notificationCenter.emitEntityUpdate).toHaveBeenCalledTimes(0);
    expect(daoManager.getDao(StateDao).bulkUpdate).toHaveBeenCalledTimes(0);
  });
});

describe('handleGroupChange', () => {
  it('should save to db and update if group', async () => {
    jest.clearAllMocks();
    await handleGroupChange([groupFactory.build({ post_cursor: 1 })]);
    expect(notificationCenter.emitEntityUpdate).toHaveBeenCalledTimes(1);
    expect(daoManager.getDao(StateDao).bulkUpdate).toHaveBeenCalledTimes(1);
  });

  it('should save to db and update if group', async () => {
    jest.clearAllMocks();
    await handleGroupChange([groupFactory.build({ post_cursor: 1 })]);
    expect(notificationCenter.emitEntityUpdate).toHaveBeenCalledTimes(1);
    expect(daoManager.getDao(StateDao).bulkUpdate).toHaveBeenCalledTimes(1);
  });
});
