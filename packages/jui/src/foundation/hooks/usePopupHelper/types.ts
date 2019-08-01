/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-07-02 18:57:30
 * Copyright © RingCentral. All rights reserved.
 */

type Variant = 'popover' | 'popper';

type PopupState = {
  open: boolean;
  hovered?: boolean;
  anchorEl?: HTMLElement;
};

export { Variant, PopupState };
