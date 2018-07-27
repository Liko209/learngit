/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-03-07 09:04:06
 */
import { daoManager, StateDao } from '../../../dao';
import notificationCenter from '../../../service/notificationCenter';
import handleData, { transform, getStates, TransformedState } from '../../../service/state/handleData';
import { sample, transformedGroupState, transformedMyState, sample2 } from './dummy';
import { rawMyStateFactory } from '../../../__tests__/factories';

jest.mock('dao', () => {
  const dao = {
    bulkUpdate: jest.fn()
  };
  return {
    daoManager: {
      getDao: jest.fn(() => dao)
    }
  };
});

jest.mock('service/notificationCenter', () => ({
  emitEntityUpdate: jest.fn(),
  emitEntityPut: jest.fn()
}));

describe('transform()', () => {
  let result: TransformedState;
  it('should transform _id to id', () => {
    result = transform(sample);
    expect(result).toMatchObject({
      id: sample._id
    });
    expect(result).not.toHaveProperty('_id');
  });
  it('should have an array property away_status_history if not exists', () => {
    const myState = rawMyStateFactory.build({});
    delete myState.away_status_history;
    result = transform(myState);
    expect(result).toMatchObject({
      away_status_history: []
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
    expect(notificationCenter.emitEntityPut).toHaveBeenCalledTimes(0);
    expect(notificationCenter.emitEntityUpdate).toHaveBeenCalledTimes(0);
    expect(daoManager.getDao(StateDao).bulkUpdate).toHaveBeenCalledTimes(0);
  });
  it('should save to db', async () => {
    await expect(handleData([sample])).resolves;
    expect(notificationCenter.emitEntityPut).toHaveBeenCalledTimes(1);
    expect(notificationCenter.emitEntityUpdate).toHaveBeenCalledTimes(1);
    expect(daoManager.getDao(StateDao).bulkUpdate).toHaveBeenCalledTimes(2);
  });
  it('should run for partial data', async () => {
    await expect(handleData([sample2])).resolves;
  });
});
