/*
 * @Author: isaac.liu
 * @Date: 2019-02-02 09:10:22
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import MuiListItem from '@material-ui/core/ListItem';
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

type JuiPinnedCellProps = {
  creator: string;
  createTime: string;
  postId: number;
  itemLen: number;
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

const CellWrapper = styled(MuiListItem)`
  && {
    display: block;
    padding: ${spacing(2)};
  }
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

const JuiPinnedCellMore = styled.div`
  color: ${grey('900')};
  margin-top: ${spacing(1)};
  font-size: ${({ theme }) => theme.typography.button.fontSize};
`;

class JuiPinnedCell extends PureComponent<JuiPinnedCellProps> {
  render() {
    const {
      creator,
      createTime,
      itemLen,
      onClick,
      content,
      postId,
    } = this.props;
    const lineCount = itemLen > 0 ? 1 : 2;

    return (
      <CellWrapper
        button={true}
        data-postid={postId}
        data-test-automation-id="pinned-section"
        onClick={onClick}
      >
        <HeadWrapper>
          <IconWrapper>
            <JuiIconography iconSize="inherit" iconColor={['grey', '500']}>
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
          {this.props.children}
        </ContentWrapper>
      </CellWrapper>
    );
  }
}

export { JuiPinnedCell, JuiPinnedCellProps, JuiPinnedCellMore };
