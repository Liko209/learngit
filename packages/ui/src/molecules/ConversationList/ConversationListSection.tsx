import React, { Component } from 'react';
import Collapse from '@material-ui/core/Collapse';
import SectionHeader, { SectionHeaderProps } from './ConversationListSectionHeader';

type SectionProps = {
  expanded?: boolean;
  onExpand?: () => any;
  onCollapse?: () => any;
} & SectionHeaderProps;

type SectionStates = {
  expanded: boolean;
};

class ConversationListSection extends Component<SectionProps, SectionStates> {
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
export { ConversationListSection };
export default ConversationListSection;
