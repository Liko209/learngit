/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-08-28 16:09:35
 * Copyright © RingCentral. All rights reserved.
 */
import { useHoverHelper } from './useHoverHelper';
import { HoverHelper } from './HoverHelper';

type HoverProps = {
  initialState?: boolean;
  children: (helper: HoverHelper) => JSX.Element;
};

const Hover = ({ initialState, children }: HoverProps) => {
  const helper = useHoverHelper(initialState);
  return children(helper);
};

export { Hover };
