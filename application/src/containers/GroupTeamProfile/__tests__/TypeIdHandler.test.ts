/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-26 15:19:02
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '../../../store/utils';
jest.mock('../../../store/utils');
import { BaseProfileTypeHandler } from '../TypeIdHandler';

function getProfileHandlerInstance(id: number) {
  return  new BaseProfileTypeHandler(id);
}
describe('BaseProfileTypeHandler', () => {
  beforeAll(() => {
    jest.resetAllMocks();
  });
  it('should return group model data while group id provided', () => {
    (getEntity as jest.Mock).mockReturnValue({ id: 9453570, is_team: true });
    expect(getProfileHandlerInstance(9453570).getGroupOrPersonData()).toMatchObject({
      id: 9453570,
      is_team: true,
    });
  });
  it('should return true if team or group id is provided', () => {
    expect(getProfileHandlerInstance(9453570).isTeamOrGroup).toBe(true);
  });
  it('should return false if person id is provided', () => {
    expect(getProfileHandlerInstance(2539535).isTeamOrGroup).toBe(false);
  });
  it('should return group if group id provided', () => {
    expect(getProfileHandlerInstance(9453570).idType).toBe('GROUP');
  });
  it('should return team if team id provided', () => {
    expect(getProfileHandlerInstance(8839174).idType).toBe('TEAM');
  });
});
