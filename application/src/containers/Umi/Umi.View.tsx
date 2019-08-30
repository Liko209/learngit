import React, { Component } from 'react';
import { UmiViewProps } from './types';
import { JuiUmi } from 'jui/components/Umi';
import { observer } from 'mobx-react';

@observer
class UmiView extends Component<UmiViewProps> {
  render() {
    const { important, unreadCount } = this.props;

    if (unreadCount === 0) return null;

    return (
      <JuiUmi variant="count" important={important} unreadCount={unreadCount} />
    );
  }
}
export { UmiView };
