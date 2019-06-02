/*
 * @Author: Paynter Chen
 * @Date: 2019-03-04 12:41:36
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';

import { storiesOf } from '@storybook/react';

import styled from '../../../foundation/styled-components';
import { DragArea, WithDragProps } from '../DragArea';

const ImageView = styled.img`
  &:hover {
    cursor: move;
  }
`;

const Image = styled.img<{ dragState: WithDragProps }>`
  ${({ dragState }) => {
    return dragState!.isDragging
      ? `transform: scale(1.5) translate(${dragState!.distance[0]}px, ${
          dragState!.distance[1]
        }px);`
      : null;
  }}
  ${({ dragState }) => {
    return dragState!.isDragging ? null : 'transition: all 0.3s;';
  }}
&:hover {
    cursor: move;
  }
`;

storiesOf('Components/DragArea', module)
  .add('Demo1', () => (
    <div>
      <DragArea
        children={(dragState: WithDragProps) => {
          return (
            <ImageView
              style={{
                transform: `translate(${dragState.offset[0]}px, ${
                  dragState.offset[1]
                }px)`,
              }}
              src="https://material-ui.com/static/images/cards/contemplative-reptile.jpg"
            />
          );
        }}
      />
    </div>
  ))
  .add('Demo2', () => (
    <div>
      <DragArea
        children={(dragState: WithDragProps) => {
          return (
            <Image
              dragState={dragState}
              src="https://material-ui.com/static/images/cards/contemplative-reptile.jpg"
            />
          );
        }}
      />
    </div>
  ));
