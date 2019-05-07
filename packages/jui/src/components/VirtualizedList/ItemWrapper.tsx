import { createElement, HTMLAttributes } from 'react';
const WRAPPER_IDENTIFIER = 'data-customized-wrapper';
const ItemWrapper = createElement<HTMLAttributes<HTMLElement>, HTMLElement>(
  'section',
  {
    [WRAPPER_IDENTIFIER]: true,
  },
);
export { ItemWrapper, WRAPPER_IDENTIFIER };
