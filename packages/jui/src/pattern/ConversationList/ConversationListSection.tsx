/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:35:07
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import Collapse from '@material-ui/core/Collapse';
import { noop, palette, grey } from '../../foundation/utils';
import styled from '../../foundation/styled-components';
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

const StyledSectionHeader = styled(JuiSectionHeader)`
  &&:active {
    color: ${palette('primary', 'main')};
    background: ${palette('primary', '50')};
  }

  &&:hover {
    background-color: ${grey('50')};
  }
`;
class JuiConversationListSection extends Component<
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
        <StyledSectionHeader
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
