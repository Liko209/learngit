/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-07-02 15:31:33
 * Copyright © RingCentral. All rights reserved.
 */
import { useState } from 'react';
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
  return new PopupHelper({
    minWidth,
    popupId,
    variant,
    state,
    setState,
  });
}

export { usePopupHelper };
