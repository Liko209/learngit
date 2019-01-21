/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-01-20 21:47:48
 * Copyright © RingCentral. All rights reserved.
 */
import VoIPDao from '../';
import { setupKV } from '../../__tests__/utils';

const KEY = 'test';
const VALUE = '123';

describe('VoIPDao', () => {
  let dao: VoIPDao;
  beforeAll(() => {
    const { kvStorage } = setupKV();
    dao = new VoIPDao(kvStorage);
  });

  it('Should be able to write/read key & value', () => {
    dao.put(KEY, VALUE);
    expect(dao.get(KEY)).toBe(VALUE);
  });

  it('Should be able to remove record by key', () => {
    dao.remove(KEY);
    expect(dao.get(KEY)).toBeNull();
  });
});
