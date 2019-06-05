/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-03-07 10:40:55
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '@/store/utils';
import { FileViewerViewModel } from '../fileViewer.ViewModel';
import FileItemModel from '@/store/models/FileItem';
jest.mock('@/store/utils');

describe('FileViewerViewModel', () => {
  beforeAll(() => {
    jest.resetAllMocks();
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
    it('should be return not undefined when call actions()', () => {
      const dismiss = jest.fn();
      const vm = new FileViewerViewModel(
        { versions: [{ pages: undefined }] } as FileItemModel,
        dismiss,
      );
      expect(vm.actions).not.toEqual(undefined);
    });
  });
});
