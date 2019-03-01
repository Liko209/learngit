/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-02-25 14:41:13
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { ZoomElement } from '../index';
import styled from '../../../foundation/styled-components';
import { Button } from '@material-ui/core';

const StyledImage = styled('img')<any>`
  position: absolute;
  top: 0px;
  left: 0px;
  width: ${({ position }) => position.width};
  height: ${({ position }) => position.height};
`;

class Test extends React.Component {
  state = {
    show: false,
    mounted: false,
    open: false,
    showOriginal: true,
  };

  imageRef: React.RefObject<HTMLImageElement> = React.createRef();

  toggleShow = () => {
    this.setState({ show: !this.state.show });
  }

  open = () => {
    this.setState({
      open: true,
      show: true,
    });
  }

  close = () => {
    this.setState({
      show: false,
    });
  }

  hide = () => {
    this.setState({ open: false });
  }

  update = () => {
    this.forceUpdate();
  }

  toggleOriginalImage = () => {
    this.setState({ showOriginal: !this.state.showOriginal });
  }

  componentDidMount() {
    this.setState({ mounted: true });
  }

  render() {
    return (
      <div style={{ height: '50vh' }}>
        {this.state.showOriginal && (
          <img
            ref={this.imageRef}
            src="https://placeimg.com/100/100/any"
            onClick={this.open}
          />
        )}
        {this.state.open && (
          <ZoomElement
            originalElement={this.imageRef.current}
            show={this.state.show}
            duration="openCloseDialog"
            easing="openCloseDialog"
            onExited={this.hide}
          >
            {(registerChild: Function) => (
              <StyledImage
                ref={element => registerChild(element)}
                position={{ width: '70%', height: '70%' }}
                src="https://placeimg.com/100/100/any"
                onClick={this.close}
              />
            )}
          </ZoomElement>
        )}
        <div>
          <Button onClick={this.update}>update</Button>
          <Button onClick={this.toggleOriginalImage}>
            {this.state.showOriginal ? 'hide' : 'show'} original image
          </Button>
        </div>
      </div>
    );
  }
}

storiesOf('Pattern/ImagePreviewer/Animation', module)
  .addDecorator(withInfoDecorator(ZoomElement, { inline: true }))
  .add('ZoomElement', () => {
    return <Test />;
  });
