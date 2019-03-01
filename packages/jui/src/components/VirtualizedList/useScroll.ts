/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-02-28 16:35:16
 * Copyright © RingCentral. All rights reserved.
 */
import { useState } from 'react';
import { useForceUpdate } from './useForceUpdate';

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
  const {
    updateTrigger: scrollEffectTrigger,
    forceUpdate: fireScrollToEffect,
  } = useForceUpdate();

  const setScrollPosition = ({ index, offset = 0 }: PartialScrollPosition) => {
    _setScrollPosition({ index, offset });
  };

  const scrollTo = (scrollPosition: PartialScrollPosition) => {
    setScrollPosition(scrollPosition);
    fireScrollToEffect();
  };

  return {
    scrollPosition,
    setScrollPosition,
    scrollTo,
    scrollEffectTrigger,
    fireScrollToEffect,
  };
};

export { useScroll };
