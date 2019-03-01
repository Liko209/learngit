/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-02-25 14:41:13
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { Slide } from '../index';
import { Button } from '@material-ui/core';

class Test extends React.Component {
  state = {
    show: false,
    mounted: false,
    open: false,
  };

  endImageRef: HTMLImageElement;
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

  componentDidMount() {
    this.setState({ mounted: true });
  }

  render() {
    return (
      <div style={{ height: '50vh' }}>
        {this.state.open && (
          <Slide
            show={this.state.show}
            duration="openCloseDialog"
            easing="openCloseDialog"
            onExited={this.hide}
          >
            <header> the is a header</header>
          </Slide>
        )}

        <div>
          <Button onClick={this.open}>open</Button>
          <Button onClick={this.close}>close</Button>
        </div>
      </div>
    );
  }
}

storiesOf('Pattern/ImagePreviewer/Animation', module)
  .addDecorator(withInfoDecorator(Slide, { inline: true }))
  .add('SlideElement', () => {
    return <Test />;
  });
