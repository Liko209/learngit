/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-02-28 16:35:16
 * Copyright © RingCentral. All rights reserved.
 */
import { useRef } from 'react';

type ScrollPosition = {
  index: number;
  offset: number;
};

type PartialScrollPosition = {
  index: number;
  offset?: number;
};

const useScroll = ({ index, offset = 0 }: PartialScrollPosition) => {
  const scrollPositionRef = useRef({
    index,
    offset,
  });
  const scrollPosition = scrollPositionRef.current;

  const setScrollPosition = ({ index, offset = 0 }: PartialScrollPosition) => {
    scrollPositionRef.current.index = index;
    scrollPositionRef.current.offset = offset;
  };

  return {
    scrollPosition,
    setScrollPosition,
  };
};

export { useScroll, ScrollPosition };
