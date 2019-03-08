/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-02-28 16:35:16
 * Copyright © RingCentral. All rights reserved.
 */
import { useState } from 'react';

type ScrollPosition = {
  index: number;
  offset: number;
  options?: ScrollIntoViewOptions | boolean;
};

type PartialScrollPosition = {
  index: number;
  offset?: number;
  options?: boolean | ScrollIntoViewOptions;
};

const useScroll = ({
  index,
  offset = 0,
  options = true,
}: PartialScrollPosition) => {
  const [scrollPosition, _setScrollPosition] = useState<ScrollPosition>({
    index,
    offset,
    options,
  });

  const setScrollPosition = ({
    index,
    offset = 0,
    options = true,
  }: PartialScrollPosition) => {
    _setScrollPosition({ index, offset, options });
  };

  return {
    scrollPosition,
    setScrollPosition,
    scrollTo,
  };
};

export { useScroll, ScrollPosition };
