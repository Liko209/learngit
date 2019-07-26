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
import _ from 'lodash';

const StyledLeftSection = styled('div')`
  flex-grow: 1;
  display: flex;
  min-width: 0;
  font-size: 0;
  align-items: center;
  white-space: nowrap;
`;
const StyledName = styled('div')`
  color: ${grey('900')};
  ${typography('caption1')} overflow: hidden;
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
  min-width: ${width(20)};
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
  box-sizing: border-box;
  color: ${grey('500')};
  ${typography('caption1')};
  span:first-child {
    padding-left: ${spacing(1)};
  }
`;

type ConversationCardHeaderProps = {
  name: string;
  status?: string;
  time: string;
  children?: React.ReactNode;
  from?: JSX.Element;
  notification?: React.ReactNode;
};

class JuiConversationCardHeader extends React.PureComponent<
  ConversationCardHeaderProps
> {
  leftSection: HTMLDivElement | null;
  constructor(props: ConversationCardHeaderProps) {
    super(props);
    this.leftSection = null;
  }

  setLeftSectionRef = (element: any) => {
    this.leftSection = element;
  };

  setHeaderItemMaxWidth() {
    if (!this.leftSection) {
      return;
    }
    const childrenWithContent = Array.from(this.leftSection.children).filter(
      childElement => childElement.hasChildNodes(),
    );
    const totalWidth = _.sum(
      childrenWithContent.map(child => child.clientWidth),
    );
    const leftSectionWidth = this.leftSection.clientWidth;
    if (totalWidth < leftSectionWidth) {
      return;
    }
    const shareChildren: Element[] = [];
    let shareChildrenCount = childrenWithContent.length;
    let sharedWidth = leftSectionWidth / shareChildrenCount;
    childrenWithContent.forEach(childElement => {
      const currentWidth = childElement.clientWidth;
      if (currentWidth < sharedWidth) {
        shareChildrenCount -= 1;
        sharedWidth = (leftSectionWidth - currentWidth) / shareChildrenCount;
      } else {
        shareChildren.push(childElement);
      }
    });
    shareChildren.forEach(
      shareChild =>
        ((shareChild as HTMLElement).style.maxWidth = `${sharedWidth}px`),
    );
  }

  componentDidMount() {
    // this.setHeaderItemMaxWidth();
    window.addEventListener('resize', this.setHeaderItemMaxWidth);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.setHeaderItemMaxWidth);
  }

  componentDidUpdate() {
    this.setHeaderItemMaxWidth();
  }

  render() {
    const { name, status, notification, from, time, children } = this.props;
    return (
      <StyledConversationCardHeader>
        <StyledLeftSection ref={this.setLeftSectionRef}>
          <StyledName data-name="name">{name}</StyledName>
          {status ? (
            <StyledStatus data-name="cardHeaderUserStatus">
              {status}
            </StyledStatus>
          ) : null}
          {notification ? (
            <StyledNotification data-name="cardHeaderNotification">
              {notification}
            </StyledNotification>
          ) : null}
          {from}
        </StyledLeftSection>
        {(time || children) && (
          <RightSection data-test-automation-id="cardHeaderRightSection">
            {time && <StyledTime data-name="time">{time}</StyledTime>}
            {children}
          </RightSection>
        )}
      </StyledConversationCardHeader>
    );
  }
}

export { JuiConversationCardHeader, StyledTime };
export default JuiConversationCardHeader;
