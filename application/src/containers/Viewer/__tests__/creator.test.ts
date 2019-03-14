/*
 * @Author: Paynter Chen
 * @Date: 2019-03-06 20:01:52
 * Copyright © RingCentral. All rights reserved.
 */

import { Dialog } from '@/containers/Dialog';
import { showImageViewer } from '../creator';

jest.mock('@/containers/Dialog', () => {
  return {
    Dialog: {
      simple: jest.fn().mockReturnValue({ dismiss: () => {} }),
    },
  };
});

describe('creator', () => {
  describe('showImageViewer', () => {
    it('should call Dialog.simple', () => {
      showImageViewer();
      expect(Dialog.simple).toBeCalled();
    });
  });
});
