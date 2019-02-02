/*
 * @Author: isaac.liu
 * @Date: 2019-02-02 09:10:22
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { JuiListItemText } from '../../../components/Lists';
import { JuiIconography } from '../../../foundation/Iconography';
import styled from '../../../foundation/styled-components';
import { height, spacing, grey } from '../../../foundation/utils';
import { Wrapper, IconWrapper } from './styles';
import { JuiPinnedItem, JuiPinnedItemProps } from './PinnedItem';

type JuiPinnedCellProps = {
  creator: string;
  createTime: string;
  items?: JuiPinnedItemProps[];
  content?: string;
  onClick?: () => void;
};

const CellWrapper = styled.div`
  padding: ${spacing(2)};
`;

const ContentWrapper = styled.div`
  padding-left: ${spacing(4)};
`;

type TextWrapperProps = {
  lineCount: number;
};

const TextWrapper = styled.div<TextWrapperProps>`
  color: ${grey('700')};
  overflow: hidden;
  position: relative;
  line-height: ${height(5)};
  max-height: ${({ lineCount }) => height(5 * lineCount)};
  margin-right: -1em;
  padding-right: 1em;
  &:before {
    content: "...";
    position: absolute;
    right: 0;
    bottom: 0;
  }
  &:after {
    content: "";
    position: absolute;
    right: 0;
    width: 1em;
    height: 1em;
    margin-top: 0.2em;
  }
  font-size: ${({ theme }) => theme.typography.button.fontSize};
`;

const TimeWrapper = styled.div`
  color: ${grey('500')};
  font-size: ${({ theme }) => theme.typography.caption1.fontSize};
`;

const MoreWrapper = styled.div`
  color: ${grey('900')};
  text-align: center;
  margin-top: ${spacing(1)};
  font-size: ${({ theme }) => theme.typography.button.fontSize};
`;

const MAX_ITEM_LENGTH = 3;

class JuiPinnedCell extends Component<JuiPinnedCellProps> {
  private _renderItems = () => {
    const { items = [] } = this.props;
    let array = items;
    let restCount = 0;
    if (items.length > MAX_ITEM_LENGTH) {
      array = items.slice(0, MAX_ITEM_LENGTH);
      restCount = items.length - array.length;
    }
    return (
      <>
        {array.map((props: JuiPinnedItemProps, index: number) => (
          <JuiPinnedItem key={index} {...props} />
        ))}
        {restCount > 0 && <MoreWrapper>and {restCount} more</MoreWrapper>}
      </>
    );
  }
  render() {
    const { creator, createTime, items = [], onClick, content } = this.props;
    const lineCount = items.length > 0 ? 2 : 1;
    return (
      <CellWrapper onClick={onClick}>
        <Wrapper>
          <IconWrapper>
            <JuiIconography>image_preview</JuiIconography>
          </IconWrapper>
          <JuiListItemText
            primary={creator}
            primaryColor={['primary', '100']}
          />
          <TimeWrapper>{createTime}</TimeWrapper>
        </Wrapper>
        <ContentWrapper>
          {content && (
            <TextWrapper lineCount={lineCount}>{content}</TextWrapper>
          )}
          {this._renderItems()}
        </ContentWrapper>
      </CellWrapper>
    );
  }
}

export { JuiPinnedCell, JuiPinnedCellProps };
