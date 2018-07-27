/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-01 14:02:33
 */
import AccountDao from '../../account';
import { setupKV } from '../../__tests__/utils';

jest.mock('foundation');

describe('AccountDao', () => {
  it('should init', () => {
    const { kvStorage } = setupKV();
    const accountDao = new AccountDao(kvStorage);
    expect(accountDao).toBeInstanceOf(AccountDao);
  });
});
