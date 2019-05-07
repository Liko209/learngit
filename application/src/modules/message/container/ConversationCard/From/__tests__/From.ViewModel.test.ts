/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-05-07 17:08:03
 * Copyright © RingCentral. All rights reserved.
 */

import { FromViewModel } from '../From.ViewModel';
import { getEntity } from '@/store/utils';
jest.mock('@/store/utils');

let fromViewModel: FromViewModel;

beforeAll(() => {
  fromViewModel = new FromViewModel();
});

describe('FromViewModel', () => {
  it('isArchived()', () => {
    (getEntity as jest.Mock).mockReturnValue({
      isArchived: true,
    });
    expect(fromViewModel.isArchived).toBe(true);
  });
  describe('displayName()', () => {
    const teamName = 'randomName';
    it('should just use displayName when isArchived is false', () => {
      (getEntity as jest.Mock).mockReturnValue({
        isArchived: false,
        displayName: teamName,
      });
      expect(fromViewModel.displayName).toBe(teamName);
    });
    it('should append " - Archived" when isArchived is true', () => {
      (getEntity as jest.Mock).mockReturnValue({
        isArchived: true,
        displayName: teamName,
      });
      expect(fromViewModel.displayName).toBe(`${teamName} - Archived`);
    });
  });
});
