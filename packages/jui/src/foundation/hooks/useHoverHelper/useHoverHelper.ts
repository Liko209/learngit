/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-08-28 15:50:58
 * Copyright © RingCentral. All rights reserved.
 */

import { useState, useRef } from 'react';
import { HoverHelper } from './HoverHelper';

const useHoverHelper = (initialHovered = false) => {
  const [hovered, setHovered] = useState(initialHovered);
  const helper = useRef<HoverHelper>();
  if (!helper.current) {
    helper.current = new HoverHelper({ hovered, setHovered });
  }
  helper.current.setHovered(hovered);
  return helper.current;
};

export { useHoverHelper };
