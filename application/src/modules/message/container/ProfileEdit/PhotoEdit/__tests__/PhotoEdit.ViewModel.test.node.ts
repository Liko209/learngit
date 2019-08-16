/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-07-30 09:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { PhotoEditViewModel } from '../PhotoEdit.ViewModel';

const transform = { scale: 2, translateX: 10, translateY: 10 };
const props = { person: { headshot: '' } };
describe('PhotoEditViewModel', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('updateScale()', () => {
    it('Should vm.scale update when call update scale', () => {
      const vm = new PhotoEditViewModel(props);
      vm.updateScale(5);
      expect(vm.transform.scale).toEqual(5);
    });
  });

  describe('updateTransform()', () => {
    it('Should vm.transform  update when call updateTransform', () => {
      const vm = new PhotoEditViewModel(props);
      vm.updateTransform(transform);
      expect(vm.transform).toEqual(transform);
    });
  });

  describe('isGifImage()', () => {
    it('Should true when uploadImageType is iamge/gif ', () => {
      const vm = new PhotoEditViewModel(props);
      vm.uploadImageType = 'image/gif';
      expect(vm.isGifImage).toEqual(true);
    });
  });
  describe('updateImageUrl()', () => {
    it('Should vm.currentFile/uploadImageType/currentImageUrl update when call updateImageUrl', () => {
      const vm = new PhotoEditViewModel(props);
      window.URL.createObjectURL = jest.fn();
      const file = { type: '11' };
      vm.updateImageUrl(file);
      expect(vm.currentFile).toEqual(file);
      expect(vm.uploadImageType).toEqual(file.type);
      expect(window.URL.createObjectURL).toHaveBeenCalled;
    });
  });
  describe('shortName()', () => {
    it('Should return shortName update when construct vm with person.shortName', () => {
      const vm = new PhotoEditViewModel({ person: { shortName: '111' } });
      expect(vm.shortName).toEqual('111');
    });
    it('Should return blank update when construct vm with person.shortName', () => {
      const vm = new PhotoEditViewModel(props);
      expect(vm.shortName).toEqual('');
    });
  });
  describe('headShotUrl()', () => {
    it('Should return headshot when headshot is string', () => {
      const vm = new PhotoEditViewModel({ person: { headshot: '111' } });
      expect(vm.headShotUrl).toEqual('111');
    });
    it('Should return headshot.url when headshot is object', () => {
      const vm = new PhotoEditViewModel({
        person: { headshot: { url: '222' } },
      });
      expect(vm.headShotUrl).toEqual('222');
    });
    it('Should return headshot.url when headshot is null', () => {
      const vm = new PhotoEditViewModel(props);
      expect(vm.headShotUrl).toEqual('');
    });
  });

  describe('shouldShowShortName()', () => {
    it('Should shouldShowShortName been false when person is null', () => {
      const vm = new PhotoEditViewModel(props);
      expect(vm.shouldShowShortName).toBeFalsy();
    });
    it('Should shouldShowShortName been true when person hasHeadShot true', () => {
      const vm = new PhotoEditViewModel({
        person: { hasHeadShot: false, shortName: 'shortName' },
      });
      expect(vm.shouldShowShortName).toBeTruthy();
    });
  });

  describe('getInitSize()', () => {
    it('Should initSize set value when call getInitSize', () => {
      const vm = new PhotoEditViewModel(props);
      vm.getInitSize(100, 100);
      expect(vm.initSize).toEqual({ width: 100, height: 100 });
    });
  });

  describe('numberToString()', () => {
    it('Should ${100x100} set value when call numberToString with 100, 100', () => {
      const vm = new PhotoEditViewModel(props);
      expect(vm.numberToString(100, 100)).toEqual('100x100');
    });
  });
});
