import React, { RefObject, createRef } from 'react';
import { storiesOf } from '@storybook/react';
import { text, number, boolean } from '@storybook/addon-knobs';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { ZoomComponent, ZoomArea, WithZoomProps, ZoomProps } from '../withZoom';
import styled from '../../../foundation/styled-components';
import {
  zoom,
  ElementRect,
  Point,
  Transform,
} from '../../../foundation/utils/calculateZoom';
const knobs = {
  step: () => number('step', 0.2),
  accuracy: () =>
    number('accuracy', 2, { step: 1, max: 10, min: 1, range: false }),
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
          <ZoomComponent
            ref={this._zoomRef}
            zoomOptions={{
              step: knobs.step(),
              accuracy: knobs.accuracy(),
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
          </ZoomComponent>
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

storiesOf('HoC/withZoom', module)
  .addDecorator(withInfoDecorator(ZoomComponent, { inline: true }))
  .add('ZoomComponent', () => (
    <div>
      <DemoWithZoomComponent />
    </div>
  ))
  .add('ZoomArea', () => (
    <div style={{ width: 400, height: 400 }}>
      <ZoomArea
        zoomOptions={{
          step: knobs.step(),
          accuracy: knobs.accuracy(),
          wheel: knobs.wheel(),
        }}
      >
        {(withZoomProps: WithZoomProps) => {
          return <div>Text in ZoomArea</div>;
        }}
      </ZoomArea>
    </div>
  ));
