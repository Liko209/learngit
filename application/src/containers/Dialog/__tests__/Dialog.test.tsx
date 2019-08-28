/*
 * @Author: ken.li
 * @Date: 2019-08-27 21:41:13
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { test, testable } from 'shield';
import { mountWithTheme } from 'shield/utils';
import { JuiDialog } from 'jui/components/Dialog';
import { modal } from '../Modal';
import { dialog } from '../Dialog';
import { dataAnalysis } from 'foundation/analysis';
import { ModalPortal } from '../ModalPortal';
import portalManager from '@/common/PortalManager';

describe('Dialog', () => {
  @testable
  class DialogSimple {
    beforeEach() {
      portalManager.dismissAll();
    }
    @test('should call data tracking if ivoked on simple dialog')
    t1() {
      dataAnalysis.track = jest.fn();
      const Wrapper = mountWithTheme(<ModalPortal />);
      modal(<div />, { open: true });
      Wrapper.update();
      Wrapper.find(JuiDialog)
        .props()
        .onClose({}, 'escapeKeyDown');
      expect(dataAnalysis.track).toHaveBeenCalled();
    }

    @test(
      'should mount JuiModal with onClose props when rendered on simple dialog',
    )
    t2() {
      const Wrapper = mountWithTheme(<ModalPortal />);
      modal(<div />, { open: true });
      Wrapper.update();
      expect(Wrapper.find(JuiDialog).props().onClose).toBeTruthy();
    }
    @test('should call data tracking if ivoked on alert dialog')
    t3() {
      dataAnalysis.track = jest.fn();
      const Wrapper = mountWithTheme(<ModalPortal />);
      dialog({ isAlert: true, title: '' });
      Wrapper.update();
      Wrapper.find(JuiDialog)
        .props()
        .onClose({}, 'escapeKeyDown');
      expect(dataAnalysis.track).toHaveBeenCalled();
    }
    @test(
      'should mount JuiModal with onClose props when rendered on alert dialog',
    )
    t4() {
      const Wrapper = mountWithTheme(<ModalPortal />);
      dialog({ isAlert: true, title: '' });
      Wrapper.update();
      expect(Wrapper.find(JuiDialog).props().onClose).toBeTruthy();
    }
  }
});
