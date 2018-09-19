import { NavPresenter } from '../NavPresenter';
import { getGlobalValue } from '@/store/utils';

jest.mock('@/config', () => {
  return jest.fn();
});

jest.mock('@/store/utils', () => {
  return {
    getGlobalValue: jest.fn().mockReturnValue(1),
  };
});

describe('NavPresenter', () => {
  const navPresenter = new NavPresenter();

  describe('title', () => {
    it('should return umi with app name if umi > 0', () => {
      expect(navPresenter.title).toEqual('(1) ');
    });
    it('should return umi with app name if umi = 0', () => {
      (getGlobalValue as jest.Mock).mockReturnValue(0);
      expect(navPresenter.title).toEqual('');
    });
  });
});
