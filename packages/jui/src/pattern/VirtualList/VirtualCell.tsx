/*
 * @Author: isaac.liu
 * @Date: 2019-01-02 17:52:53
 * Copyright © RingCentral. All rights reserved.
 */
import { CSSProperties } from 'react';
import styled from '../../foundation/styled-components';

type JuiVirtualCellOnLoadFunc = () => void;

type JuiVirtualCellProps = {
  onLoad?: JuiVirtualCellOnLoadFunc;
  style: CSSProperties;
  index: number;
};

const JuiVirtualCellWrapper = styled.div``;

export { JuiVirtualCellOnLoadFunc, JuiVirtualCellProps, JuiVirtualCellWrapper };
