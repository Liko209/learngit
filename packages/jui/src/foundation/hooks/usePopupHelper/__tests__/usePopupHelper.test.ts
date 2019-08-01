/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-07-02 15:31:33
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { act } from 'react-dom/test-utils';
import { renderHooks } from 'shield/utils';
import { usePopupHelper } from '../usePopupHelper';

describe('usePopupState()', () => {
  it('should open popup when the trigger emits onClick event', () => {
    const hookRef = renderHooks(() =>
      usePopupHelper({ popupId: 'test_popup', variant: 'popover' }),
    );

    expect(hookRef.current.MenuProps).toEqual(
      expect.objectContaining({
        id: 'test_popup',
        anchorEl: undefined,
        open: false,
      }),
    );

    const clickTarget = {};
    act(() =>
      hookRef.current.TriggerProps.onClick({
        currentTarget: clickTarget,
      } as React.SyntheticEvent),
    );

    expect(hookRef.current.MenuProps).toEqual(
      expect.objectContaining({
        id: 'test_popup',
        anchorEl: clickTarget,
        open: true,
      }),
    );
  });

  it('should close popup when the trigger emits onClose event', () => {
    const hookRef = renderHooks(() =>
      usePopupHelper({ popupId: 'test_popup', variant: 'popover' }),
    );

    act(() =>
      hookRef.current.TriggerProps.onClick({ currentTarget: {} } as any),
    );

    expect(hookRef.current.MenuProps.open).toBeTruthy();

    act(() => hookRef.current.MenuProps.onClose());

    expect(hookRef.current.MenuProps.open).toBeFalsy();
    expect(hookRef.current.MenuProps.anchorEl).toBeUndefined();
  });
});
