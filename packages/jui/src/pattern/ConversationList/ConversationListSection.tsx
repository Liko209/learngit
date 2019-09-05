/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:35:07
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import Collapse, { CollapseProps } from '@material-ui/core/Collapse';
import { noop } from '../../foundation/utils';
import JuiSectionHeader, {
  JuiSectionHeaderProps,
} from './ConversationListSectionHeader';
import styled from '../../foundation/styled-components';

type SectionProps = {
  expanded?: boolean;
  onExpand?: Function;
  onCollapse?: Function;
  umi?: JSX.Element;
  title: string;
  paddingRange?: number;
} & JuiSectionHeaderProps;

type SectionStates = {
  expanded: boolean;
};

type JuiCollapseProps = Pick<CollapseProps, 'in'>;

const StyledCollapse = styled<JuiCollapseProps>(Collapse)`
  &.MuiCollapse-container.MuiCollapse-hidden {
    visibility: initial;
  }
`;

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

  static getDerivedStateFromProps(props: SectionProps, state: SectionStates) {
    // parent will change expanded so use this change current expanded
    return {
      ...state,
      expanded: props.expanded,
    };
  }

  render() {
    const { umi, onExpand, onCollapse, ...restProps } = this.props;
    const { expanded } = this.state;

    return (
      <div>
        <JuiSectionHeader
          className="conversation-list-section-header"
          {...restProps}
          expanded={expanded}
          umi={umi}
          onClick={this._handleClick}
        />
        <StyledCollapse in={expanded}>{this.props.children}</StyledCollapse>
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
