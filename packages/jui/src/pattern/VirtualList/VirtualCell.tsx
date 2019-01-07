/*
 * @Author: isaac.liu
 * @Date: 2019-01-02 17:52:53
 * Copyright © RingCentral. All rights reserved.
 */
import { CSSProperties } from 'react';

type JuiVirtualCellOnLoadFunc = () => void;

// cell must apply the `style` to it-self
type JuiVirtualCellProps = {
  onLoad: JuiVirtualCellOnLoadFunc;
  style: CSSProperties;
};

export { JuiVirtualCellOnLoadFunc, JuiVirtualCellProps };
