/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:35:07
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import Collapse from '@material-ui/core/Collapse';
import { noop } from '../../foundation/utils';
import JuiSectionHeader, {
  JuiSectionHeaderProps,
} from './ConversationListSectionHeader';

type SectionProps = {
  expanded?: boolean;
  onExpand?: Function;
  onCollapse?: Function;
  umi?: JSX.Element;
  icon?: string;
  title: string;
} & JuiSectionHeaderProps;

type SectionStates = {
  expanded: boolean;
};

class JuiConversationListSection extends PureComponent<
  SectionProps,
  SectionStates
> {
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
    const { umi } = this.props;
    const { expanded } = this.state;

    return (
      <div>
        <JuiSectionHeader
          className="conversation-list-section-header"
          {...this.props}
          expanded={expanded}
          umi={umi}
          onClick={this._handleClick}
        />
        <Collapse in={expanded}>{this.props.children}</Collapse>
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
export { JuiConversationListSection };
export default JuiConversationListSection;
