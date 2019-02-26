/// <reference path="../../../__tests__/types.d.ts" />
import { indexData } from '../../../api';

import { fetchIndexData } from '../fetchIndexData';

jest.mock('../../../api', () => ({
  indexData: jest.fn(),
}));

describe('sync fetchIndexData()', () => {
  beforeEach(() => {});

  it('Should be called when get remote data has newer_than args', async () => {
    const data = { a: 1 };
    indexData.mockResolvedValue(data);
    const res = await fetchIndexData('123');
    expect(res).toEqual(data);
  });
});
