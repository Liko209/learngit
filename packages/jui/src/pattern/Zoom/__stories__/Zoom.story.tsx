/*
 * @Author: Paynter Chen
 * @Date: 2019-02-28 15:16:55
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, ReactElement, RefObject } from 'react';

import MuiDialog, { DialogProps } from '@material-ui/core/Dialog';
import { boolean, number, text } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';

import styled from '../../../foundation/styled-components';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiDragZoom } from '../DragZoom';
import { JuiZoomImage } from '../ZoomImage';
import { JuiImageView } from '../ImageView';

const knobs = {
  open: () => boolean('open', true),
  src: () =>
    text('src', 'https://fengyuanchen.github.io/viewerjs/images/tibet-3.jpg'),
  // ratio: () =>
  //   number('ratio', 1, {
  //     range: true,
  //     min: 0.1,
  //     max: 2,
  //     step: 0.1,
  //   }),
  containerWidth: () => number('containerWidth', 600),
  containerHeight: () => number('containerHeight', 400),
};
storiesOf('Pattern/Zoom', module)
  .addDecorator(withInfoDecorator(JuiZoomImage, { inline: true }))
  .add('DragZoom', () => (
    <div
      style={{
        width: knobs.containerWidth(),
        height: knobs.containerHeight(),
      }}
    >
      <JuiDragZoom>
        {({ autoFitContentRect }) => {
          if (autoFitContentRect) {
            return (
              <img
                style={{
                  width: autoFitContentRect.width,
                  height: autoFitContentRect.height,
                }}
                src={knobs.src()}
                alt=""
              />
            );
          }
          return <img src={knobs.src()} alt="" />;
        }}
      </JuiDragZoom>
    </div>
  ));

storiesOf('Pattern/Zoom', module)
  .addDecorator(withInfoDecorator(JuiDragZoom, { inline: true }))
  .add('DragZoom', () => (
    <div
      style={{
        width: knobs.containerWidth(),
        height: knobs.containerHeight(),
      }}
    >
      <JuiDragZoom>
        {({ autoFitContentRect }) => {
          if (autoFitContentRect) {
            return (
              <img
                style={{
                  width: autoFitContentRect.width,
                  height: autoFitContentRect.height,
                }}
                src={knobs.src()}
                alt=""
              />
            );
          }
          return <img src={knobs.src()} alt="" />;
        }}
      </JuiDragZoom>
    </div>
  ))
  .add('DragZoom ImageView', () => {
    const imageRef: RefObject<any> = React.createRef();
    return (
      <div
        style={{
          width: knobs.containerWidth(),
          height: knobs.containerHeight(),
        }}
      >
        <JuiDragZoom contentRef={imageRef}>
          {({ autoFitContentRect }) => {
            return (
              <JuiImageView
                viewRef={imageRef}
                src={knobs.src()}
                width={autoFitContentRect ? autoFitContentRect.width : 0}
                height={autoFitContentRect ? autoFitContentRect.height : 0}
              />
            );
          }}
        </JuiDragZoom>
      </div>
    );
  })
  .add('ZoomImage', () => (
    <MuiDialog open={knobs.open()} fullScreen={true}>
      <JuiZoomImage src={knobs.src()} />
    </MuiDialog>
  ));
