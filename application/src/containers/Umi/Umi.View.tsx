import React, { Component } from 'react';
import { UmiViewProps } from './types';
import { JuiUmi } from 'jui/components';
import { observer } from 'mobx-react';

@observer
class UmiView extends Component<UmiViewProps> {
  render() {
    const { important, unreadCount } = this.props;
    return (
      <JuiUmi variant="count" important={important} unreadCount={unreadCount} />
    );
  }
}
export { UmiView };
