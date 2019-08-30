/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-03-07 10:40:55
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '@/store/utils';
import { SingleImageViewerViewModel } from '../SingleImageViewer.ViewModel';
import { ENTITY_NAME } from '@/store';
import { ServiceLoader } from 'sdk/module/serviceLoader';

jest.mock('@/store/utils');
jest.mock('@/utils/error');
const url = 'URL';
const name = 'name';
const personService = {
  getHeadShotWithSize: () => url,
};
const dismiss = jest.fn();
function getVM() {
  const vm = new SingleImageViewerViewModel({ url, titleName: name, dismiss });
  return vm;
}

describe('SingleImageViewerViewModel', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    ServiceLoader.getInstance = jest.fn().mockReturnValue(personService);
  });
  describe('viewerDestroyer()', () => {
    it('should dismiss be call when call viewerDestroyer function', () => {
      const vm = getVM();
      vm.viewerDestroyer();
      expect(dismiss).toHaveBeenCalled();
    });
  });

  describe('pages()', () => {
    it('should be return url null when person and personId undefined', () => {
      const vm = new SingleImageViewerViewModel({
        url: null,
        titleName: null,
        dismiss,
      });
      expect(vm.pages).toEqual([
        {
          url: '',
          viewport: {
            origHeight: 0,
            origWidth: 0,
          },
        },
      ]);
    });
    it('should be return url when has person and personId ', () => {
      const vm = getVM();
      expect(vm.pages).toEqual([
        {
          url,
          viewport: {
            origHeight: 0,
            origWidth: 0,
          },
        },
      ]);
    });
  });

  describe('title()', () => {
    it('should be return displayName when call title()', () => {
      const vm = getVM();
      vm.onUpdate();
      expect(vm.title).toEqual({
        displayName: name,
      });
    });
  });

  describe('hasPrevious()', () => {
    it('should hasPrevious and hasNext false', () => {
      const vm = getVM();
      expect(vm.hasPrevious).toBeFalsy;
      expect(vm.hasNext).toBeFalsy;
    });
  });
});
