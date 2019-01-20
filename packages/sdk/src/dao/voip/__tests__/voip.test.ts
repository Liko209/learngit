/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-01-20 21:47:48
 * Copyright © RingCentral. All rights reserved.
 */
import VoIPDao from '../';
import { setupKV } from '../../__tests__/utils';

const KEY = 'test';
const VALUE = '123';

describe('', () => {
  let dao: VoIPDao;
  beforeAll(() => {
    const { kvStorage } = setupKV();
    dao = new VoIPDao(kvStorage);
  });

  it('get/set voip key', () => {
    dao.put(KEY, VALUE);
    expect(dao.get(KEY)).toBe(VALUE);

    dao.remove(KEY);
    expect(dao.get(KEY)).toBeNull();
  });
});
