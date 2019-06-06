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
  // describe('pages()', () => {
  //   it('should be return undefined when pages undefined', () => {
  //     const dismiss = jest.fn();
  //     const vm = new FileViewerViewModel(
  //       { versions: [{ pages: undefined }] } as FileItemModel,
  //       dismiss,
  //     );
  //     expect(vm.pages).toEqual(undefined);
  //   });
  //   it('should be return not undefined when pages not undefined', () => {
  //     const dismiss = jest.fn();
  //     const vm = new FileViewerViewModel(
  //       { versions: [{ pages: [1, 2] }] } as FileItemModel,
  //       dismiss,
  //     );
  //     expect(vm.pages.length).toEqual(2);
  //   });
  // });
  // describe('info()', () => {
  //   it('should be return not undefined when call info()', () => {
  //     const dismiss = jest.fn();
  //     const vm = new FileViewerViewModel(
  //       { versions: [{ pages: undefined }] } as FileItemModel,
  //       dismiss,
  //     );
  //     expect(vm.info).not.toEqual(undefined);
  //   });
  // });
  // describe('handleTextFieldChange()', () => {
  //   it('should be return 2  when call input 2 length 2', () => {
  //     const dismiss = jest.fn();
  //     const vm = new FileViewerViewModel(
  //       { versions: [{ pages: [1, 2] }] } as FileItemModel,
  //       dismiss,
  //     );
  //     vm.handleTextFieldChange({ target: { value: '2' } });
  //     expect(vm['_textFieldValue']).toEqual(2);
  //   });

  //   it('should be return 2  when call input 3 length 2', () => {
  //     const dismiss = jest.fn();
  //     const vm = new FileViewerViewModel(
  //       { versions: [{ pages: [1, 2] }] } as FileItemModel,
  //       dismiss,
  //     );
  //     vm.handleTextFieldChange({ target: { value: '3' } });
  //     expect(vm['_textFieldValue']).toEqual(2);
  //   });

  //   it('should be return 1 when call input -1 length 2', () => {
  //     const dismiss = jest.fn();
  //     const vm = new FileViewerViewModel(
  //       { versions: [{ pages: [1, 2] }] } as FileItemModel,
  //       dismiss,
  //     );
  //     vm.handleTextFieldChange({ target: { value: '-1' } });
  //     expect(vm['_textFieldValue']).toEqual(1);
  //   });
  // });
});
