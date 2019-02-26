/*
 * @Author: Paynter Chen
 * @Date: 2019-02-28 15:16:55
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, ReactElement } from 'react';

import MuiDialog, { DialogProps } from '@material-ui/core/Dialog';
import { boolean, number, text } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';

import styled from '../../../foundation/styled-components';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiDragZoom, JuiDragZoomProps, withDragZoom } from '../DragZoom';
import { JuiZoomImage } from '../ZoomImage';

const knobs = {
  open: () => boolean('open', true),
  src: () =>
    text('src', 'https://fengyuanchen.github.io/viewerjs/images/tibet-3.jpg'),
  ratio: () =>
    number('ratio', 1, {
      range: true,
      min: 0.1,
      max: 2,
      step: 0.1,
    }),
  containerWidth: () => number('containerWidth', 600),
  containerHeight: () => number('containerHeight', 400),
};

const Image = styled.img<JuiDragZoomProps>`
  ${({ transform }) => {
    return `transform: scale(${transform.scale}) translate(${
      transform.translateX
    }px, ${transform.translateY}px);`;
  }}
  ${({ dragState }) => {
    return !dragState.isDragging ? 'transition: all 0.3s;' : null;
  }}
  &:hover {
    cursor: move;
  }
`;
// class DemoWithZoomComponent extends React.Component<any, any> {
//   private _zoomRef: RefObject<any> = createRef();
//   constructor(props: any) {
//     super(props);
//     this.state = {
//       transform: {
//         scale: 1,
//         translateX: 0,
//         translateY: 0,
//       },
//     };
//   }

//   render() {
//     const { transform } = this.state;
//     return (
//       <div>
//         <div>
//           <ZoomComponent
//             ref={this._zoomRef}
//             transform={this.state.transform}
//             onTransformChange={(transform: Transform) => {
//               this.setState({
//                 transform,
//               });
//             }}
//           >
//             <TransformDiv transform={transform}>哈哈</TransformDiv>
//           </ZoomComponent>
//         </div>

//       </div>
//     );
//   }
// }
class PassPropsComponent extends Component<{
  p1: string;
  children: ReactElement;
}> {
  render() {
    const { children } = this.props;
    return React.cloneElement(React.Children.only(children), {
      haha: ' this is My inject prop',
      fff: '',
    });
  }
}

class ChildrenComponent extends Component<{ c1: string }> {
  render() {
    console.log('children component:', this.props);
    return <div>sfdfdfdfdffffff</div>;
  }
}

storiesOf('Pattern/Zoom', module)
  .addDecorator(withInfoDecorator(JuiZoomImage, { inline: true }))
  .add('DragZoom', () => (
    <div>
      <JuiDragZoom>
        <Image src={knobs.src()} alt="" />
      </JuiDragZoom>
      {/* <div>
          <ChildrenComponent c1="cc1" />
        </div>
        <PassPropsComponent p1="pp1">
          <ChildrenComponent c1="cc1" />
        </PassPropsComponent>
        <PassPropsComponent p1="pp1">
          <div>ss</div>
        </PassPropsComponent> */}
    </div>
  ))
  .add('ZoomImage', () => (
    <MuiDialog open={knobs.open()} fullScreen={true}>
      <JuiZoomImage
        src={knobs.src()}
        ratio={knobs.ratio()}
        containerWidth={knobs.containerWidth()}
        containerHeight={knobs.containerHeight()}
      />
    </MuiDialog>
  ));
