/*
 * @Author: isaac.liu
 * @Date: 2019-04-01 14:25:24
 * Copyright © RingCentral. All rights reserved.
 */

import React, { useState } from 'react';
import uuid from 'uuid';
import { storiesOf } from '@storybook/react';
import { number } from '@storybook/addon-knobs';
import styled from '../../../foundation/styled-components';
import { JuiDialog } from '../../Dialog';
import { JuiSizeDetector, Size } from '..';
import { JuiVirtualizedList } from '../../VirtualizedList';

const Wrapper = styled.div`
  height: 100%;
  display: flex;
`;

storiesOf('Components/SizeDetector', module).add('toast', () => {
  const kCellCount = number('cell count', 1000);
  const ids = Array(kCellCount)
    .fill(null)
    .map(() => uuid.v4());

  const Demo = () => {
    const [getSize, setSize] = useState<Partial<Size>>({
      width: undefined,
      height: undefined,
    });
    const ITEM_HEIGHT = 48;
    const MIN_HEIGHT = ITEM_HEIGHT;
    const MAX_HEIGHT = 8 * ITEM_HEIGHT;

    const { height = ITEM_HEIGHT } = getSize;
    const renderItems = () => {
      return ids.map((id: string) => (
        <div key={id} style={{ minHeight: ITEM_HEIGHT, height: ITEM_HEIGHT }}>
          {id}
        </div>
      ));
    };
    const handleSizeChanged = (size: Size) => {
      const preferHeight = Math.min(
        Math.max(Math.min(MAX_HEIGHT, ids.length * ITEM_HEIGHT), MIN_HEIGHT),
        size.height,
      );
      setSize({ width: size.width, height: preferHeight });
    };

    return (
      <Wrapper>
        <JuiSizeDetector handleSizeChanged={handleSizeChanged} />
        <JuiDialog open={true}>
          <JuiVirtualizedList
            height={height}
            minRowHeight={ITEM_HEIGHT}
            overscan={5}
            stickToBottom={false}
            stickToLastPosition={false}
          >
            {renderItems()}
          </JuiVirtualizedList>
        </JuiDialog>
      </Wrapper>
    );
  };
  return <Demo />;
});
