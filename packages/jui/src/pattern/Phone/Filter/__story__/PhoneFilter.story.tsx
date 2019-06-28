/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-06-26 10:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { storiesOf } from '@storybook/react';
import { JuiPhoneFilter } from '../PhoneFilter';

class PhoneFilterStory extends Component {
  state = { value: '' };

  changeValue = (value: string) => this.setState({ value });

  render() {
    return (
      <div>
        <JuiPhoneFilter
          clearButtonLabel="Clear Voicemail Filter"
          placeholder="Filter Voicemail"
          onChange={this.changeValue}
        />
        <p>Input Value: {this.state.value}</p>
      </div>
    );
  }
}

storiesOf('Pattern/Phone', module).add('PhoneFilter', () => (
  <PhoneFilterStory />
));
