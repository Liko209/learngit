/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:35:07
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import Collapse from '@material-ui/core/Collapse';
import { noop } from '../../utils';
import { Divider } from '../../atoms';
import SectionHeader, { SectionHeaderProps } from './ConversationListSectionHeader';

type SectionProps = {
  expanded?: boolean;
  onExpand?: Function;
  onCollapse?: Function;
} & SectionHeaderProps;

type SectionStates = {
  expanded: boolean;
};

class ConversationListSection extends Component<SectionProps, SectionStates> {
  static defaultProps = {
    onExpand: noop,
    onCollapse: noop,
  };

  constructor(props: SectionProps) {
    super(props);

    this.state = {
      expanded: this.props.expanded || false,
    };
    this._handleClick = this._handleClick.bind(this);
  }

  render() {
    const { expanded } = this.state;
    return (
      <div>
        <SectionHeader
          {...this.props}
          expanded={expanded}
          onClick={this._handleClick}
        />
        <Collapse in={expanded}>
          {this.props.children && <Divider />}
          {this.props.children}
        </Collapse>
      </div>
    );
  }

  private _handleClick() {
    const { expanded } = this.state;
    const newExpanded = !expanded;
    this.setState({ expanded: newExpanded });
    if (newExpanded) {
      this.props.onExpand!();
    } else {
      this.props.onCollapse!();
    }
  }
}
export { ConversationListSection };
export default ConversationListSection;
