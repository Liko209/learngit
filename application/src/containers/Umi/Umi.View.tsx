import React, { Component } from 'react';
import { UmiViewProps } from './types';
import { observer } from 'mobx-react';
import { JuiUmi } from 'jui/components';

@observer
class UmiView extends Component<UmiViewProps> {
  constructor(props: UmiViewProps) {
    super(props);
  }
  render() {
    const { umiVariant, important, unreadCount } = this.props;
    return (
      <JuiUmi
        variant={umiVariant}
        important={important}
        unreadCount={unreadCount}
      />
    );
  }
}
export { UmiView };
