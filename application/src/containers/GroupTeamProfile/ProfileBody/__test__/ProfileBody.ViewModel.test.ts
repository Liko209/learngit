/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-24 22:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { BaseProfileTypeHandler } from '../../TypeIdHandler';

function getProfileHandlerInstance(id: number) {
  return new BaseProfileTypeHandler(id);
}
describe('ProfileBodyViewModel', () => {
  it('should return team if team id provided', () => {
    expect(getProfileHandlerInstance(8839174).idType).toBe('TEAM');
  });
});
