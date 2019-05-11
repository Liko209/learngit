/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-02-25 14:41:13
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiSlide } from '../index';
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
          <JuiSlide
            show={this.state.show}
            duration="standard"
            easing="sharp"
            onExited={this.hide}
            appear={true}
            transformProperties="height"
          >
            <header> the is a header</header>
          </JuiSlide>
        )}

        <div>
          <Button onClick={this.open}>open</Button>
          <Button onClick={this.close}>close</Button>
        </div>
      </div>
    );
  }
}

storiesOf('Components/Animation', module)
  .addDecorator(withInfoDecorator(JuiSlide, { inline: true }))
  .add('JuiSlide', () => {
    return <Test />;
  });
