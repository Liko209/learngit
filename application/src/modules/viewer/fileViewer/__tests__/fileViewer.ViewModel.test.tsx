/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-03-07 10:40:55
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '@/store/utils';
import { FileViewerViewModel } from '../fileViewer.ViewModel';
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
      const vm = new FileViewerViewModel(
        { versions: [{ pages: undefined }] } as FileItemModel,
        dismiss,
      );
      expect(vm.pages).toEqual(undefined);
    });
    it('should be return not undefined when pages not undefined', () => {
      const dismiss = jest.fn();
      const vm = new FileViewerViewModel(
        { versions: [{ pages: [1, 2] }] } as FileItemModel,
        dismiss,
      );
      expect(vm.pages.length).toEqual(2);
    });
  });
  describe('info()', () => {
    it('should be return not undefined when call info()', () => {
      const dismiss = jest.fn();
      const vm = new FileViewerViewModel(
        { versions: [{ pages: undefined }] } as FileItemModel,
        dismiss,
      );
      expect(vm.info).not.toEqual(undefined);
    });
  });
  describe('title()', () => {
    it('should be return not undefined when call title()', () => {
      const dismiss = jest.fn();
      const vm = new FileViewerViewModel(
        { versions: [{ pages: undefined }] } as FileItemModel,
        dismiss,
      );
      expect(vm.title).not.toEqual(undefined);
    });
  });
  describe('actions()', () => {
    it('The viewer should be closed automatically when the file being previewed was deleted [JPT-2155]', async () => {
      const dismiss = jest.fn();
      const vm = new FileViewerViewModel(
        {
          deactivated: true,
          versions: [{ pages: undefined }],
        } as FileItemModel,
        dismiss,
      );
      expect(Notification.flashToast).toHaveBeenCalledWith(
        toastParamsBuilder('viewer.ImageDeleted'),
      );
    });
    it('The viewer should not show error when the file being previewed was not deleted', async () => {
      const dismiss = jest.fn();
      const vm = new FileViewerViewModel(
        {
          deactivated: true,
          versions: [{ pages: undefined }],
        } as FileItemModel,
        dismiss,
      );
      expect(Notification.flashToast).toHaveBeenCalledWith(
        toastParamsBuilder('viewer.ImageDeleted'),
      );
    });
  });
});
