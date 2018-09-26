import HomePresenter from '../HomePresenter';
import { service } from 'sdk';

const { AuthService } = service;
jest.mock('@/config', () => {
  return jest.fn();
});

jest.mock('@/config/whitelist.json', () => {
  return jest.fn();
});

describe('HomePresenter', () => {
  const homePresenter = new HomePresenter();
  it('should call service logout when handleSignOutClick', async () => {
    const spy = jest.spyOn(AuthService.getInstance() as AuthService, 'logout');
    await homePresenter.handleSignOutClick();
    expect(spy).toBeCalled();
  });
});
