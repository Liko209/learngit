import React from 'react';
import { storiesOf } from '@storybook/react';
// import { text, number, boolean } from '@storybook/addon-knobs';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { DragArea, WithDragProps } from '../withDrag';
import styled from '../../../foundation/styled-components';

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

const knobs = {};
storiesOf('HoC/withDrag', module)
  .addDecorator(withInfoDecorator(DragArea, { inline: true }))
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
