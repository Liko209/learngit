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
import { TelephonyStore } from '@/modules/telephony/store/TelephonyStore';
import { jupiter } from 'framework/Jupiter';

describe('Dialog', () => {
  jupiter.registerClass(TelephonyStore);
  @testable
  class DialogSimple {
    beforeEach() {
      portalManager.dismissAll();
    }
    @test('should call data tracking if ivoked on simple dialog [JPT-2896]')
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
      'should mount JuiModal with onClose props when rendered on simple dialog [JPT-2896]',
    )
    t2() {
      const Wrapper = mountWithTheme(<ModalPortal />);
      modal(<div />, { open: true });
      Wrapper.update();
      expect(Wrapper.find(JuiDialog).props().onClose).toBeTruthy();
    }
    @test('should call data tracking if ivoked on alert dialog [JPT-2896]')
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
      'should mount JuiModal with onClose props when rendered on alert dialog [JPT-2896]',
    )
    t4() {
      const Wrapper = mountWithTheme(<ModalPortal />);
      dialog({ isAlert: true, title: '' });
      Wrapper.update();
      expect(Wrapper.find(JuiDialog).props().onClose).toBeTruthy();
    }
    @test('should disable disableEscapeKeyDown event when loading [JPT-2928]')
    t5() {
      const Wrapper = mountWithTheme(<ModalPortal />);
      dialog({ isAlert: true, title: '', loading: true });
      Wrapper.update();
      expect(Wrapper.find(JuiDialog).props().disableEscapeKeyDown).toBeTruthy();
    }
    @test(
      'should not disable disableEscapeKeyDown event when not loading [JPT-2928]',
    )
    t6() {
      const Wrapper = mountWithTheme(<ModalPortal />);
      dialog({ isAlert: true, title: '', loading: false });
      Wrapper.update();
      expect(Wrapper.find(JuiDialog).props().disableEscapeKeyDown).toBeFalsy();
    }
  }
});
