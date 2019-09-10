/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-03-07 10:40:55
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '@/store/utils';
import { FileViewerViewModel } from '../FileViewer.ViewModel';
import { Notification } from '@/containers/Notification';
import { ENTITY_NAME } from '@/store';
import * as mobx from 'mobx';

jest.mock('@/store/utils');
jest.mock('@/containers/Notification');
jest.mock('@/utils/error');
const dismiss = jest.fn();
function getVM() {
  const vm = new FileViewerViewModel(1, 2, dismiss);
  return vm;
}

describe('FileViewerViewModel', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    const fileItem = {
      latestVersion: { pages: [1, 2] },
      getDirectRelatedPostInGroup: jest.fn(() => ({})),
    };
    (getEntity as jest.Mock).mockReturnValue(fileItem);
    Notification.flashToast = jest.fn();
  });
  describe('viewerDestroyer()', () => {
    it('should dismiss be call when call viewerDestroyer function', () => {
      const dismiss = jest.fn();
      (getEntity as jest.Mock).mockReturnValue({
        latestVersion: { pages: [] },
        getDirectRelatedPostInGroup: jest.fn(() => ({})),
      });
      const vm = new FileViewerViewModel(1, 2, dismiss);
      vm.viewerDestroyer();
      expect(dismiss).toHaveBeenCalled();
    });
  });

  describe('constructor()', () => {
    it('should init correctly', () => {
      const autoRunSpy = jest.spyOn(mobx, 'autorun').mockImplementation(e => e);

      const vm = getVM();
      expect(vm._sender).toBe(null);
      expect(vm._createdAt).toBe(null);
      expect(autoRunSpy).toHaveBeenCalledWith(vm.updateSenderInfo, undefined);
      autoRunSpy.mockRestore();
    });
  });

  describe('pages()', () => {
    it('should be return undefined when pages undefined', () => {
      (getEntity as jest.Mock).mockReturnValue({
        latestVersion: { pages: undefined },
        getDirectRelatedPostInGroup: jest.fn(() => ({})),
      });
      const vm = getVM();

      expect(vm.pages).toEqual(undefined);
    });
    it('should be return not undefined when pages not undefined', () => {
      (getEntity as jest.Mock).mockReturnValue({
        latestVersion: { pages: [1, 2] },
        getDirectRelatedPostInGroup: jest.fn(() => ({})),
      });
      const vm = getVM();

      expect(vm.pages && vm.pages.length).toEqual(2);
    });
  });

  describe('update()', () => {
    it('should _currentPageIdx be 1 when pageIdx =1 and _currentPageIdx = 1 ', () => {
      const data = { scale: 1, pageIdx: 1 };
      (getEntity as jest.Mock).mockReturnValue({
        latestVersion: { pages: undefined },
        getDirectRelatedPostInGroup: jest.fn(() => ({})),
      });
      const vm = getVM();
      vm['_currentPageIdx '] = 1;
      vm.onUpdate(data);
      expect(vm['_currentPageIdx']).toEqual(1);
    });
    it('should _currentPageIdx be 2 when pageIdx =1 and _currentPageIdx = 2', () => {
      const data = { scale: 1, pageIdx: 2 };
      (getEntity as jest.Mock).mockReturnValue({
        latestVersion: { pages: undefined },
        getDirectRelatedPostInGroup: jest.fn(() => ({})),
      });
      const vm = getVM();
      vm['_currentPageIdx '] = 1;
      vm.onUpdate(data);
      expect(vm['_currentPageIdx']).toEqual(2);
    });

    it('should _currentScale be 1 when pageIdx =1 and _currentScale = 1 ', () => {
      const data = { scale: 0.5, pageIdx: 1 };
      (getEntity as jest.Mock).mockReturnValue({
        latestVersion: { pages: undefined },
        getDirectRelatedPostInGroup: jest.fn(() => ({})),
      });
      const vm = getVM();
      vm['_currentScale '] = 0.5;
      vm.onUpdate(data);
      expect(vm['_currentScale']).toEqual(0.5);
    });
    it('should _currentScale be 2 when pageIdx =1 and _currentScale = 2', () => {
      const data = { scale: 1, pageIdx: 1 };
      (getEntity as jest.Mock).mockReturnValue({
        latestVersion: { pages: undefined },
        getDirectRelatedPostInGroup: jest.fn(() => ({})),
      });
      const vm = getVM();
      vm['_currentScale '] = 0.5;
      vm.onUpdate(data);
      expect(vm['_currentScale']).toEqual(1);
    });
  });

  describe('title()', () => {
    it('should be return not undefined when call title()', () => {
      (getEntity as jest.Mock).mockReturnValue({
        latestVersion: { pages: undefined },
        getDirectRelatedPostInGroup: () => 123,
      });
      const vm = getVM();
      expect(vm.title).toBeTruthy();
    });
  });

  describe('handleTextFieldChange()', () => {
    it('should be return 2  when call input 2 length 2', () => {
      const vm = getVM();
      vm.handleTextFieldChange({ target: { value: '2' } });
      expect(vm['_textFieldValue']).toEqual(2);
    });
    it('should be return 2  when call input 3 length 2', () => {
      const vm = getVM();
      vm.handleTextFieldChange({ target: { value: '3' } });
      expect(vm['_textFieldValue']).toEqual(2);
    });

    it('should be return 1 when call input -1 length 2', () => {
      const vm = getVM();
      vm.handleTextFieldChange({ target: { value: '-1' } });
      expect(vm['_textFieldValue']).toEqual(1);
    });
  });

  describe('updateSenderInfo()', () => {
    it('should get post from item.getDirectRelatedPostInGroup', async (done: any) => {
      const fileItem = {
        latestVersion: { pages: [1, 2] },
        getDirectRelatedPostInGroup: jest.fn(),
      };
      (getEntity as jest.Mock).mockReturnValue(fileItem);
      const vm = getVM();

      await vm.updateSenderInfo();

      expect(fileItem.getDirectRelatedPostInGroup).toHaveBeenCalled();

      done();
    });

    it('should get sender when item.getDirectRelatedPostInGroup return post', async (done: any) => {
      const fileItem = {
        latestVersion: { pages: [1, 2] },
        getDirectRelatedPostInGroup: jest.fn(() => ({ creator_id: 123 })),
      };
      (getEntity as jest.Mock).mockReturnValue(fileItem);
      const vm = getVM();

      await vm.updateSenderInfo();

      expect(getEntity).toHaveBeenCalledWith(ENTITY_NAME.PERSON, 123);

      done();
    });

    it('should set sender and createdAt to null when cannot get post [JPT-2399]', async (done: any) => {
      const fileItem = {
        latestVersion: { pages: [1, 2] },
        getDirectRelatedPostInGroup: jest.fn(() => null),
      };
      (getEntity as jest.Mock).mockReturnValue(fileItem);
      const vm = getVM();
      vm._sender = {};
      vm._createdAt = {};
      expect(vm._sender).toBeTruthy();

      await vm.updateSenderInfo();

      expect(vm._sender).toBe(null);
      expect(vm._createdAt).toBe(null);

      done();
    });
  });
});
