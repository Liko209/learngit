/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-02-25 14:41:13
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiZoomElement } from '../index';
import styled from '../../../foundation/styled-components';
import { Button } from '@material-ui/core';

const StyledImage = styled('img')<any>`
  position: fixed;
  top: 20%;
  left: 20%;
  width: ${({ position }) => position.width};
  height: ${({ position }) => position.height};
`;

class Test extends React.Component {
  state = {
    show: true,
    mounted: false,
    open: false,
    showOriginal: true,
  };

  imageRef: React.RefObject<HTMLImageElement> = React.createRef();
  targetImage = null;

  setTargetImageRef = (element: any) => {
    this.targetImage = element;
    this.forceUpdate();
  }

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
          <>
            <StyledImage
              ref={this.setTargetImageRef}
              position={{ width: '70vh', height: '70vh' }}
              src="https://placeimg.com/100/100/any"
              onClick={this.close}
            />
            {this.targetImage && (
              <JuiZoomElement
                originalElement={this.imageRef.current}
                targetElement={this.targetImage!}
                show={this.state.show}
                duration="standard"
                easing="openCloseDialog"
                onExited={this.hide}
              />
            )}
          </>
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

storiesOf('Components/Animation', module)
  .addDecorator(withInfoDecorator(JuiZoomElement, { inline: true }))
  .add('JuiZoomElement', () => {
    return <Test />;
  });
