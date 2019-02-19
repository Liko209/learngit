/*
 * @Author: isaac.liu
 * @Date: 2019-02-02 09:10:22
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import { JuiListItemText } from '../../../components/Lists';
import { JuiIconography } from '../../../foundation/Iconography';
import styled from '../../../foundation/styled-components';
import {
  height,
  width,
  spacing,
  grey,
  ellipsis,
  lineClamp,
} from '../../../foundation/utils';
import { JuiPinnedItem, JuiPinnedItemProps } from './PinnedItem';

type JuiPinnedCellProps = {
  creator: string;
  createTime: string;
  postId: number;
  items?: JuiPinnedItemProps[];
  content?: string;
  onClick?: () => void;
};

const HeadWrapper = styled.div`
  height: ${height(5)};
  display: flex;
  align-items: center;
`;

const IconWrapper = styled.div`
  && {
    display: flex;
    align-items: center;
    justify-content: center;
    width: ${width(4)};
    height: ${height(4)};
    margin: ${spacing(0, 1, 0, 1)};
    font-size: ${({ theme }) => theme.typography.subheading1.fontSize};
  }
`;

const CellWrapper = styled.div`
  padding: ${spacing(2)};
`;

const ContentWrapper = styled.div`
  padding-left: ${spacing(6)};
  overflow: hidden;
`;

type TextWrapperProps = {
  lineCount: number;
};

const TextWrapper = styled.div<TextWrapperProps>`
  color: ${grey('700')};
  overflow: hidden;
  position: relative;
  line-height: ${height(5)};
  ${({ lineCount }) => (lineCount === 1 ? ellipsis() : lineClamp(2, 10))};
  font-size: ${({ theme }) => theme.typography.button.fontSize};
`;

const TimeWrapper = styled.div`
  color: ${grey('500')};
  font-size: ${({ theme }) => theme.typography.caption1.fontSize};
`;

const MoreWrapper = styled.div`
  color: ${grey('900')};
  margin-top: ${spacing(1)};
  font-size: ${({ theme }) => theme.typography.button.fontSize};
`;

const MAX_ITEM_LENGTH = 3;

class JuiPinnedCell extends PureComponent<JuiPinnedCellProps> {
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
          <JuiPinnedItem key={props.id} {...props} />
        ))}
        {restCount > 0 && <MoreWrapper>and {restCount} more</MoreWrapper>}
      </>
    );
  }
  render() {
    const {
      creator,
      createTime,
      items = [],
      onClick,
      content,
      postId,
    } = this.props;
    const lineCount = items.length > 0 ? 1 : 2;

    return (
      <CellWrapper
        data-postId={postId}
        data-test-automation-id="pinned-section"
        onClick={onClick}
      >
        <HeadWrapper>
          <IconWrapper>
            <JuiIconography fontSize="inherit" color={['grey', '500']}>
              pin
            </JuiIconography>
          </IconWrapper>
          <JuiListItemText
            data-test-automation-id="pinned-creator"
            primary={creator}
            primaryColor={['grey', '900']}
          />
          <TimeWrapper data-test-automation-id="pinned-createTime">
            {createTime}
          </TimeWrapper>
        </HeadWrapper>
        <ContentWrapper>
          {content && (
            <TextWrapper
              data-test-automation-id="pinned-text"
              lineCount={lineCount}
            >
              {content}
            </TextWrapper>
          )}
          {this._renderItems()}
        </ContentWrapper>
      </CellWrapper>
    );
  }
}

export { JuiPinnedCell, JuiPinnedCellProps };
