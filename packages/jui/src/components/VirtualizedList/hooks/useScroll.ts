/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-02-28 16:35:16
 * Copyright © RingCentral. All rights reserved.
 */
import { useState } from 'react';

type ScrollPosition = {
  index: number;
  offset: number;
};

type PartialScrollPosition = {
  index: number;
  offset?: number;
};

const useScroll = ({ index, offset = 0 }: PartialScrollPosition) => {
  const [scrollPosition, _setScrollPosition] = useState<ScrollPosition>({
    index,
    offset,
  });

  const setScrollPosition = ({ index, offset = 0 }: PartialScrollPosition) => {
    _setScrollPosition({ index, offset });
  };

  return {
    scrollPosition,
    setScrollPosition,
    scrollTo,
  };
};

export { useScroll, ScrollPosition };
