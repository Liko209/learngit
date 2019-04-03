/*
 * @Author: Paynter Chen
 * @Date: 2019-03-04 12:42:23
 * Copyright © RingCentral. All rights reserved.
 */
import React, { createRef, RefObject } from 'react';

import { boolean, number } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';

import styled from '../../../foundation/styled-components';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { Transform } from '../types';
import { JuiWithZoomProps, JuiZoomArea, JuiZoomComponent } from '../ZoomArea';

const knobs = {
  step: () => number('step', 0.2),
  wheel: () => boolean('wheel', true),
};

const TransformDiv = styled.div<{
  transform: Transform;
}>`
  ${({ transform }) => {
    return `transform: scale(${transform.scale}) translate(${
      transform.translateX
    }px, ${transform.translateY}px);`;
  }}
`;
class DemoWithZoomComponent extends React.Component<any, any> {
  private _zoomRef: RefObject<any> = createRef();
  constructor(props: any) {
    super(props);
    this.state = {
      transform: {
        scale: 1,
        translateX: 0,
        translateY: 0,
      },
    };
  }

  render() {
    const { transform } = this.state;
    return (
      <div>
        <div style={{ width: 400, height: 400 }}>
          <JuiZoomComponent
            ref={this._zoomRef}
            zoomOptions={{
              step: knobs.step(),
              wheel: knobs.wheel(),
            }}
            transform={this.state.transform}
            onTransformChange={(transform: Transform) => {
              this.setState({
                transform,
              });
            }}
          >
            {() => {
              return (
                <TransformDiv transform={transform}>
                  Text in ZoomComponent
                </TransformDiv>
              );
            }}
          </JuiZoomComponent>
        </div>

        <div>
          <button
            onClick={() => {
              this._zoomRef.current.zoomStep(-knobs.step());
            }}
          >
            -
          </button>
          <span>{transform.scale}</span>
          <button
            onClick={() => {
              this._zoomRef.current.zoomStep(knobs.step());
            }}
          >
            +
          </button>
          <button
            onClick={() => {
              this.setState({
                transform: {
                  scale: 1,
                  translateX: 0,
                  translateY: 0,
                },
              });
            }}
          >
            reset
          </button>
        </div>
      </div>
    );
  }
}

storiesOf('Components/ZoomArea', module)
  .addDecorator(withInfoDecorator(JuiZoomComponent, { inline: true }))
  .add('ZoomComponent', () => (
    <div>
      <DemoWithZoomComponent />
    </div>
  ))
  .add('ZoomArea', () => (
    <div style={{ width: '100%', height: 400 }}>
      <JuiZoomArea
        zoomOptions={{
          step: knobs.step(),
          wheel: knobs.wheel(),
        }}
      >
        {(withZoomProps: JuiWithZoomProps) => {
          return <div>Text in ZoomArea</div>;
        }}
      </JuiZoomArea>
    </div>
  ));
