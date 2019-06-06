/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-03-07 10:40:55
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '@/store/utils';
jest.mock('@/store/utils');
import { FileViewerViewModel } from '../FileViewer.ViewModel';
import FileItemModel from '@/store/models/FileItem';
import { Notification } from '@/containers/Notification';
import {
  ToastMessageAlign,
  ToastType,
} from '@/containers/ToastWrapper/Toast/types';
jest.mock('@/store/utils');

jest.mock('@/containers/Notification');
jest.mock('@/utils/error');

function toastParamsBuilder(message: string) {
  return {
    message,
    type: ToastType.ERROR,
    messageAlign: ToastMessageAlign.LEFT,
    fullWidth: false,
    dismissible: false,
  };
}

describe('FileViewerViewModel', () => {
  beforeAll(() => {
    jest.resetAllMocks();
  });

  beforeEach(() => {
    Notification.flashToast = jest.fn();
  });
  describe('viewerDestroyer()', () => {
    it('should dismiss be call when call viewerDestroyer function', () => {
      const dismiss = jest.fn();
      const vm = new FileViewerViewModel({} as FileItemModel, dismiss);
      vm.viewerDestroyer();
      expect(dismiss).toBeCalled();
    });
  });
  describe('pages()', () => {
    it('should be return undefined when pages undefined', () => {
      const dismiss = jest.fn();
      (getEntity as jest.Mock).mockReturnValue({
        versions: [{ pages: undefined }],
      });
      const vm = new FileViewerViewModel(1, dismiss);

      expect(vm.pages).toEqual(undefined);
    });
    it('should be return not undefined when pages not undefined', () => {
      const dismiss = jest.fn();
      (getEntity as jest.Mock).mockReturnValue({
        versions: [{ pages: [1, 2] }],
      });
      const vm = new FileViewerViewModel(1, dismiss);

      expect(vm.pages && vm.pages.length).toEqual(2);
    });
  });

  describe('update()', () => {
    it('should _currentPageIdx be 1 when pageIdx =1 and _currentPageIdx = 1 ', () => {
      const data = { scale: 1, pageIdx: 1 };
      const dismiss = jest.fn();
      (getEntity as jest.Mock).mockReturnValue({
        versions: [{ pages: undefined }],
      });
      const vm = new FileViewerViewModel(1, dismiss);
      vm['_currentPageIdx '] = 1;
      vm.onUpdate(data);
      expect(vm['_currentPageIdx']).toEqual(1);
    });
    it('should _currentPageIdx be 2 when pageIdx =1 and _currentPageIdx = 2', () => {
      const data = { scale: 1, pageIdx: 2 };
      const dismiss = jest.fn();
      (getEntity as jest.Mock).mockReturnValue({
        versions: [{ pages: undefined }],
      });
      const vm = new FileViewerViewModel(1, dismiss);
      vm['_currentPageIdx '] = 1;
      vm.onUpdate(data);
      expect(vm['_currentPageIdx']).toEqual(2);
    });

    it('should _currentScale be 1 when pageIdx =1 and _currentScale = 1 ', () => {
      const data = { scale: 0.5, pageIdx: 1 };
      const dismiss = jest.fn();
      (getEntity as jest.Mock).mockReturnValue({
        versions: [{ pages: undefined }],
      });
      const vm = new FileViewerViewModel(1, dismiss);
      vm['_currentScale '] = 0.5;
      vm.onUpdate(data);
      expect(vm['_currentScale']).toEqual(0.5);
    });
    it('should _currentScale be 2 when pageIdx =1 and _currentScale = 2', () => {
      const data = { scale: 1, pageIdx: 1 };
      const dismiss = jest.fn();
      (getEntity as jest.Mock).mockReturnValue({
        versions: [{ pages: undefined }],
      });
      const vm = new FileViewerViewModel(1, dismiss);
      vm['_currentScale '] = 0.5;
      vm.onUpdate(data);
      expect(vm['_currentScale']).toEqual(1);
    });
  });
  describe('title()', () => {
    it('should be return not undefined when call title()', () => {
      const dismiss = jest.fn();
      const vm = new FileViewerViewModel(1, dismiss);
      (getEntity as jest.Mock).mockReturnValue({
        versions: [{ pages: undefined }],
      });
      expect(vm.title).not.toEqual(undefined);
    });
  });
  describe('handleTextFieldChange()', () => {
    it('should be return 2  when call input 2 length 2', () => {
      const dismiss = jest.fn();
      (getEntity as jest.Mock).mockReturnValue({
        versions: [{ pages: [1, 2] }],
      });
      const vm = new FileViewerViewModel(1, dismiss);
      vm.handleTextFieldChange({ target: { value: '2' } });
      expect(vm['_textFieldValue']).toEqual(2);
    });
    it('should be return 2  when call input 3 length 2', () => {
      const dismiss = jest.fn();
      const vm = new FileViewerViewModel(1, dismiss);
      (getEntity as jest.Mock).mockReturnValue({
        versions: [{ pages: [1, 2] }],
      });
      vm.handleTextFieldChange({ target: { value: '3' } });
      expect(vm['_textFieldValue']).toEqual(2);
    });

    it('should be return 1 when call input -1 length 2', () => {
      const dismiss = jest.fn();
      const vm = new FileViewerViewModel(1, dismiss);
      (getEntity as jest.Mock).mockReturnValue({
        versions: [{ pages: [1, 2] }],
      });
      vm.handleTextFieldChange({ target: { value: '-1' } });
      expect(vm['_textFieldValue']).toEqual(1);
    });
  });
});
