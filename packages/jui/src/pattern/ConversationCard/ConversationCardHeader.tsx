/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-11 11:38:48
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import {
  spacing,
  typography,
  grey,
  ellipsis,
  width,
} from '../../foundation/utils';
import styled from '../../foundation/styled-components';

const StyledLeftSection = styled('div')`
  flex-grow: 1;
  display: flex;
  min-width: 0;
  font-size: 0;
  align-items: center;
`;
const StyledName = styled('div')`
  color: ${grey('900')};
  ${typography('caption')} overflow: hidden;
  ${ellipsis()};
`;
const StyledStatus = styled('div')`
  padding-left: ${spacing(1)};
  box-sizing: border-box;
  color: ${grey('600')};
  ${typography('caption2')};
  ${ellipsis()};
`;
const StyledTime = styled('div')`
  color: ${grey('500')};
  white-space: nowrap;
  ${typography('caption2')};
  width: ${width(20)};
  text-align: right;
`;
const RightSection = styled('div')`
  margin-left: ${spacing(1)};
  display: inline-flex;
`;
const StyledConversationCardHeader = styled('div')`
  padding: ${spacing(3, 4, 2, 0)};
  display: flex;
  align-items: center;
`;
const StyledNotification = styled.div`
  ${ellipsis()};
  padding-left: ${spacing(1)};
  box-sizing: border-box;
  color: ${grey('500')};
  ${typography('caption1')};
`;

type ConversationCardHeaderProps = {
  name: string;
  status?: string;
  time: string;
  children?: React.ReactNode;
  from?: JSX.Element;
  notification?: React.ReactNode;
};

class JuiConversationCardHeader extends React.Component<
  ConversationCardHeaderProps,
  { headerItemMaxWidth: null | number }
> {
  leftSection: HTMLDivElement | null;
  constructor(props: ConversationCardHeaderProps) {
    super(props);
    this.state = {
      headerItemMaxWidth: null,
    };
    this.leftSection = null;
  }

  setLeftSectionRef = (element: any) => {
    this.leftSection = element;
  }

  setHeaderItemMaxWidth() {
    if (!this.leftSection) {
      return;
    }
    const width =
      this.leftSection.clientWidth / this.leftSection.childNodes.length;
    if (this.state.headerItemMaxWidth !== width) {
      this.setState({
        headerItemMaxWidth: width,
      });
    }
  }

  componentDidMount() {
    this.setHeaderItemMaxWidth();
    window.addEventListener('resize', this.setHeaderItemMaxWidth.bind(this));
  }

  componentDidUpdate() {
    this.setHeaderItemMaxWidth();
  }

  render() {
    const { name, status, notification, from, time, children } = this.props;
    const inlineStyle = {
      maxWidth: `${this.state.headerItemMaxWidth}px`,
    };
    return (
      <StyledConversationCardHeader>
        <StyledLeftSection ref={this.setLeftSectionRef}>
          <StyledName data-name="name" style={inlineStyle}>
            {name}
          </StyledName>
          {status ? (
            <StyledStatus data-name="cardHeaderUserStatus" style={inlineStyle}>
              {status}
            </StyledStatus>
          ) : null}
          {notification ? (
            <StyledNotification style={inlineStyle}>
              {notification}
            </StyledNotification>
          ) : null}
          {from ? React.cloneElement(from, { style: inlineStyle }) : null}
        </StyledLeftSection>
        <RightSection>
          <StyledTime data-name="time">{time}</StyledTime>
          {children}
        </RightSection>
      </StyledConversationCardHeader>
    );
  }
}

export { JuiConversationCardHeader };
export default JuiConversationCardHeader;
