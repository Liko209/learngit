/// <reference path="../../../__tests__/types.d.ts" />
import { daoManager } from '../../../dao';
import ConfigDao from '../../../dao/config';
import { LAST_INDEX_TIMESTAMP } from '../../../dao/config/constants';
import { indexData } from '../../../api';

import { fetchIndexData } from '../fetchIndexData';

jest.mock('../../../api', () => ({
  indexData: jest.fn(),
}));

const configDao = daoManager.getKVDao(ConfigDao);

describe('sync fetchIndexData()', () => {
  beforeEach(() => {
    configDao.clear();
  });

  it('Should be called when get remote data has newer_than args', async () => {
    const data = { a: 1 };
    configDao.put(LAST_INDEX_TIMESTAMP, 123);
    indexData.mockResolvedValue(data);
    const res = await fetchIndexData('123');
    expect(res).toEqual(data);
  });
});
