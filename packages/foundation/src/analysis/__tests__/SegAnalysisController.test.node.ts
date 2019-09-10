/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-04-08 10:54:15
 * Copyright © RingCentral. All rights reserved.
 */

import { SegAnalysisController } from '../SegAnalysisController';
import Segment from 'load-segment';
jest.mock('load-segment');

class MockSegment {
  identify = jest.fn();
  page = jest.fn();
  reset = jest.fn();
  track = jest.fn();
}

let segAnalysisController: SegAnalysisController;
let segment: MockSegment;

describe('SegAnalysisController', () => {
  beforeEach(() => {
    segAnalysisController = new SegAnalysisController();
    segment = new MockSegment();
    Segment.mockReturnValue(segment);
    Object.assign(segAnalysisController, { _segment: segment });
  });


  describe('init', ()=>{
    it('should not init segment when key is empty', ()=>{
      Object.assign(segAnalysisController, { _segment: undefined });
      expect(segAnalysisController['_segment']).toBeUndefined();
      segAnalysisController.init('');
      expect(segAnalysisController['_segment']).toBeUndefined();
    });
    it('should init segment when key is not empty', ()=>{
      Object.assign(segAnalysisController, { _segment: undefined });
      expect(segAnalysisController['_segment']).toBeUndefined();
      segAnalysisController.init('1');
      expect(segAnalysisController['_segment']).not.toBeUndefined();
    });
  });

  describe('getEndPoint', () => {
    it('should return web when there is not key "jupiterElectron" in window', () => {
      window['jupiterElectron'] = undefined;
      expect(segAnalysisController.getEndPoint()).toEqual('web');
    });
    it('should return mac', () => {
      window['jupiterElectron'] = true;
      Object.defineProperty(navigator, 'platform', {
        get: jest.fn().mockReturnValueOnce('MacIntel'),
      });
      expect(segAnalysisController.getEndPoint()).toEqual('mac');
    });
  });
  describe('identify', () => {
    it('should not call segment identify when segment is null', () => {
      Object.assign(segAnalysisController, { _segment: null });
      segAnalysisController.identify(1);
      expect(segment.identify).not.toHaveBeenCalled();
    });
    it('should call segment identify when segment is not null - 1', () => {
      jest
        .spyOn(segAnalysisController, 'getEndPoint')
        .mockReturnValueOnce('mac');

      segAnalysisController.identify(1, {});
      expect(segment.identify).toHaveBeenCalledWith(1, { endPoint: 'mac' });
    });

    it('should call segment identify when segment is not null - 2', () => {
      jest
        .spyOn(segAnalysisController, 'getEndPoint')
        .mockReturnValueOnce('mac');

      segAnalysisController.identify(1);
      expect(segment.identify).toHaveBeenCalledWith(1, { endPoint: 'mac' });
    });
  });

  describe('track', () => {
    it('should not call segment track when segment is null', () => {
      Object.assign(segAnalysisController, { _segment: null });
      segAnalysisController.track('sendPost');
      expect(segment.track).not.toHaveBeenCalled();
    });
    it('should call segment track when segment is not null - 1', () => {
      jest
        .spyOn(segAnalysisController, 'getEndPoint')
        .mockReturnValueOnce('mac');

      segAnalysisController.track('sendPost', {});
      expect(segment.track).toHaveBeenCalledWith('sendPost', {
        endPoint: 'mac',
      });
    });

    it('should call segment identify when segment is not null - 2', () => {
      jest
        .spyOn(segAnalysisController, 'getEndPoint')
        .mockReturnValueOnce('mac');

      segAnalysisController.track('sendPost');
      expect(segment.track).toHaveBeenCalledWith('sendPost', {
        endPoint: 'mac',
      });
    });
  });
  describe('page', () => {
    it('should not call when null', () => {
      Object.assign(segAnalysisController, { _segment: null });
      segAnalysisController.page('');
      expect(segment.page).not.toHaveBeenCalled();
    });

    it('should call page', () => {
      jest
        .spyOn(segAnalysisController, 'getEndPoint')
        .mockReturnValueOnce('mac');
      segAnalysisController.page('good');
      expect(segment.page).toHaveBeenCalledWith('good', { endPoint: 'mac' });
    });
  });
  describe('reset', () => {
    it('should not call when null', () => {
      Object.assign(segAnalysisController, { _segment: null });
      segAnalysisController.reset();
      expect(segment.reset).not.toHaveBeenCalled();
    });
    it('should call reset', () => {
      segAnalysisController.reset();
      expect(segment.reset).toHaveBeenCalled();
    });
  });
  describe('isProduction', () => {
    it('should be true when is public', () => {
      segAnalysisController.setProduction(true);
      expect(segAnalysisController.isProduction()).toBeTruthy();
    });
    it('should be false when is not production or public', () => {
      expect(segAnalysisController.isProduction()).toBeFalsy();
    });
  });
});
