import { UmiViewProps } from './types';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { JuiUmi } from 'jui/patterns';

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
