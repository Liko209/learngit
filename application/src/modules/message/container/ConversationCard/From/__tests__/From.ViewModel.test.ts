/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-05-07 17:08:03
 * Copyright © RingCentral. All rights reserved.
 */

import { FromViewModel } from '../From.ViewModel';
import { getEntity } from '@/store/utils';
jest.mock('@/store/utils');
jest.mock('@/utils/i18nT', () => (key: string) => {
  const translation = {
    'people.team.archivedSuffix': ' - Archived',
  };
  return translation[key] || '';
});

function setup({ group }: any) {
  (getEntity as jest.Mock).mockReturnValue(group);
  const vm = new FromViewModel();
  return { vm };
}

describe('FromViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('disabled', () => {
    it('should be true when group was archived', () => {
      const { vm } = setup({
        group: {
          isArchived: true,
        },
      });
      expect(vm.disabled).toBeTruthy();
    });
  });

  describe('displayName', () => {
    it('should just use displayName when isArchived is false', () => {
      const { vm } = setup({
        group: {
          isArchived: false,
          displayName: 'group1',
        },
      });
      expect(vm.displayName).toBe('group1');
    });
    it('should append " - Archived" when isArchived is true', (done: jest.DoneCallback) => {
      const { vm } = setup({
        group: {
          isArchived: true,
          displayName: 'group1',
        },
      });

      setImmediate(() => {
        expect(vm.displayName).toBe('group1 - Archived');
        done();
      });
    });
  });
});
