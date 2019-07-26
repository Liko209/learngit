/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-07-02 15:31:33
 * Copyright © RingCentral. All rights reserved.
 */
import { useState } from 'react';
import { PopupHelper } from './PopupHelper';
import { Variant, PopupState } from './types';

function usePopupHelper({
  popupId,
  variant,
}: {
  popupId?: string;
  variant: Variant;
}) {
  const [state, setState] = useState<PopupState>({
    open: false,
    hovered: false,
  });
  return new PopupHelper({
    popupId,
    variant,
    state,
    setState,
  });
}

export { usePopupHelper };
