/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-07-02 15:31:33
 * Copyright © RingCentral. All rights reserved.
 */
import { useState, useMemo } from 'react';
import { PopupHelper } from './PopupHelper';
import { Variant, PopupState } from './types';

function usePopupHelper({
  minWidth,
  popupId,
  variant,
}: {
  minWidth?: number;
  popupId?: string;
  variant: Variant;
}) {
  const [state, setState] = useState<PopupState>({
    open: false,
    hovered: false,
  });
  return useMemo(
    () =>
      new PopupHelper({
        minWidth,
        popupId,
        variant,
        state,
        setState,
      }),
    [minWidth, popupId, variant, state],
  );
}

export { usePopupHelper };
