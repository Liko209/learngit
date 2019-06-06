/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-06-04 14:08:06
 * Copyright © RingCentral. All rights reserved.
 */
import { ToggleController, ToggleRequest } from '../ToggleController';

describe('ToggleController', () => {
  let toggleController: ToggleController;
  let doFn;
  let undoFn;

  function setup() {
    toggleController = new ToggleController();
    doFn = jest.fn();
    undoFn = jest.fn();
  }

  beforeEach(() => {
    setup();
  });

  describe('do', () => {
    it('should call do fn when do is called first time', () => {
      toggleController.do({ value: true, func: doFn });
      expect(toggleController._isDoing).toBeTruthy();
      expect(doFn).toBeCalledTimes(1);
    });

    it('should put request to queue when there is ongoing request', () => {
      toggleController.do({ value: true, func: doFn });
      toggleController.do({ value: false, func: undoFn });
      expect(toggleController._isDoing).toBeTruthy();
      expect(doFn).toBeCalledTimes(1);
      expect(toggleController._requests.length).toBe(1);
    });

    it('should merge request if necessary', () => {
      toggleController.do({ value: true, func: doFn });
      toggleController.do({ value: false, func: undoFn });
      toggleController.do({ value: true, func: doFn });
      expect(toggleController._isDoing).toBeTruthy();
      expect(doFn).toBeCalledTimes(1);
      expect(toggleController._requests.length).toBe(0);
    });
  });

  describe('onSuccess', () => {
    it('should stop when no task in queue', () => {
      toggleController.do({ value: true, func: doFn });
      toggleController.onSuccess();
      expect(toggleController._isDoing).toBeFalsy();
      expect(doFn).toBeCalledTimes(1);
      expect(toggleController._requests.length).toBe(0);
    });

    it('should start the task in queue', () => {
      toggleController.do({ value: true, func: doFn });
      toggleController.do({ value: false, func: undoFn });
      toggleController.onSuccess();
      expect(doFn).toBeCalledTimes(1);
      expect(undoFn).toBeCalledTimes(1);
      expect(toggleController._isDoing).toBeTruthy();
    });

    it('should stop when all tasks is completed', () => {
      toggleController.do({ value: true, func: doFn });
      toggleController.do({ value: false, func: undoFn });
      toggleController.onSuccess();
      toggleController.onSuccess();
      expect(doFn).toBeCalledTimes(1);
      expect(undoFn).toBeCalledTimes(1);
      expect(toggleController._requests.length).toBe(0);
      expect(toggleController._isDoing).toBeFalsy();
    });
  });

  describe('onFailure', () => {
    it('should stop doing task when no task in queue', () => {
      toggleController.do({ value: true, func: doFn });
      toggleController.onFailure();
      expect(toggleController._isDoing).toBeFalsy();
    });
    it('should stop doing next task when previous one failed', () => {
      toggleController.do({ value: true, func: doFn });
      toggleController.do({ value: false, func: undoFn });
      expect(toggleController._requests.length).toBe(1);
      toggleController.onFailure();
      expect(toggleController._isDoing).toBeFalsy();
      expect(toggleController._requests.length).toBe(0);
    });
  });
});
