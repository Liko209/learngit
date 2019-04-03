/*
 * @Author: Paynter Chen
 * @Date: 2019-02-28 15:16:55
 * Copyright © RingCentral. All rights reserved.
 */
import React, { SyntheticEvent } from 'react';

import { boolean, number, text } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';

import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiDragZoom, JuiWithDragZoomProps } from '../DragZoom';

const knobs = {
  open: () => boolean('open', true),
  src: () =>
    text(
      'src',
      'http://s05.lmbang.com/M00/D8/50/DpgiA1vgXpyASri_AAAqnnNQsJI075.jpg',
    ),
  containerWidth: () => number('containerWidth', 600),
  containerHeight: () => number('containerHeight', 400),
};
storiesOf('Pattern/DragZoom', module)
  .addDecorator(withInfoDecorator(JuiDragZoom, { inline: true }))
  .add('DragZoom', () => (
    <div
      style={{
        width: knobs.containerWidth(),
        height: knobs.containerHeight(),
      }}
    >
      <JuiDragZoom
        applyTransform={true}
        zoomInText="scale up"
        zoomOutText="scale down"
        zoomResetText="scale reset"
      >
        {(props: JuiWithDragZoomProps) => {
          const { fitWidth, fitHeight, notifyContentSizeChange } = props;
          const imgStyle = {} as React.CSSProperties;
          if (fitWidth && fitHeight) {
            imgStyle.width = fitWidth;
            imgStyle.height = fitHeight;
          }
          return (
            <img
              style={imgStyle}
              src={knobs.src()}
              onLoad={(event: SyntheticEvent<HTMLImageElement>) => {
                notifyContentSizeChange(
                  event.currentTarget.naturalWidth,
                  event.currentTarget.naturalHeight,
                );
              }}
            />
          );
        }}
      </JuiDragZoom>
    </div>
  ));
