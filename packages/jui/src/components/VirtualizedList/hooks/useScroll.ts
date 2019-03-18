/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-02-28 16:35:16
 * Copyright © RingCentral. All rights reserved.
 */
import { useRef } from 'react';

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
  const scrollPositionRef = useRef({
    index,
    offset,
    options,
  });
  const scrollPosition = scrollPositionRef.current;

  const rememberScrollPosition = ({
    index,
    offset = 0,
    options = true,
  }: PartialScrollPosition) => {
    scrollPositionRef.current.index = index;
    scrollPositionRef.current.offset = offset;
    scrollPositionRef.current.options = options;
  };

  return {
    scrollPosition,
    rememberScrollPosition,
  };
};

export { useScroll, ScrollPosition, PartialScrollPosition };
