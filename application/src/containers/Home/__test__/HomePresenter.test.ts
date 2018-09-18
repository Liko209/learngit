import HomePresenter from '../HomePresenter';
import { getGlobalValue } from '@/store/utils';

jest.mock('@/config', () => {
  return jest.fn();
});

jest.mock('@/store/utils', () => {
  return {
    getGlobalValue: jest.fn().mockReturnValue(1),
  };
});

describe('HomePresenter', () => {
  const homePresenter = new HomePresenter();
  homePresenter.appName = 'a';
  describe('title', () => {
    it('should return umi with app name if umi > 0', () => {
      expect(homePresenter.title).toEqual('(1) a');
    });
    it('should return umi with app name if umi = 0', () => {
      (getGlobalValue as jest.Mock).mockReturnValue(0);
      expect(homePresenter.title).toEqual('a');
    });
  });
});
