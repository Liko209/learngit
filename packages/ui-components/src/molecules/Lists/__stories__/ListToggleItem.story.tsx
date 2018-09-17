/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-17 15:03:20
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean } from '@storybook/addon-knobs/react';

import ListToggleButton from '../ListToggleButton';

function getKnobs() {
  const disabled = boolean('disabled', false);
  return {
    disabled,
  };
}
class ListContainer extends React.Component<{}, { items: any[] }> {
  constructor(props) {
    super(props);
    this.state = {
      items: [
        {
          text: '123123123',
          checked: false,
        },
        {
          text: '22222222222',
          checked: true,
        },
      ],
    };
  }

  handleChange = (item, checked) => {
    const items = [...this.state.items];
    const oldIndex = items.findIndex(oldItem => oldItem.text === item.text);
    items[oldIndex].checked = checked;
    this.setState({
      items,
    });
  }

  render() {
    const { items } = this.state;
    return <ListToggleButton items={items} toggleChange={this.handleChange} />;
  }
}

storiesOf('Molecules/Lists', module).addWithJSX('ListToggleButton', () => {
  return <ListContainer />;
});
