/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-02-25 14:41:13
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../../foundation/utils/decorators';
import { ZoomElementAnimation } from '../index';
import styled from '../../../../foundation/styled-components';
import { Button, CssBaseline } from '@material-ui/core';

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
    setTimeout(() => {
      this.setState({ open: false });
    },         800);
  }

  update = () => {
    this.forceUpdate();
  }

  componentDidMount() {
    this.setState({ mounted: true });
  }

  render() {
    return (
      <div style={{ height: '50vh' }}>
        <img
          ref={this.imageRef}
          src="https://placeimg.com/100/100/any"
          onClick={this.open}
        />
        {this.state.open && (
          <ZoomElementAnimation
            originalElement={this.imageRef.current}
            show={this.state.show}
            animationLength="0.8s"
          >
            {(registerChild: Function) => (
              <StyledImage
                ref={element => registerChild(element)}
                position={{ width: '70%', height: '70%' }}
                src="https://placeimg.com/100/100/any"
                onClick={this.close}
              />
            )}
          </ZoomElementAnimation>
        )}
        <div>
          <Button onClick={this.update}>update</Button>
        </div>
      </div>
    );
  }
}

storiesOf('Pattern/ImagePreviewer/Animation', module)
  .addDecorator(withInfoDecorator(ZoomElementAnimation, { inline: true }))
  .add('ZoomElement', () => {
    return <Test />;
  });
