/*
 * @Author: isaac.liu
 * @Date: 2019-05-02 08:23:29
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../../foundation/styled-components';
import { spacing, palette, height } from '../../../foundation/utils';
import { Body, BodyProps } from './Body';
import { MarkDownView } from './base';
import { ThumbImageView } from './ImageView';

type AttachmentItemProps = {
  pretext?: string;
  thumb_url?: string;
} & BodyProps;

const Wrapper = styled.div<{ hasThumb?: boolean; leftBorderColor?: string }>`
  min-height: ${height(25)};
  position: relative;
  /* copy from dThor */
  background: #fcfcfc;
  border: 1px solid #eff0ef;
  margin: ${spacing(2.5, 0, 2.5, 0)};
  padding: ${spacing(5, 5, 1, 5)};
  border-left: 2px solid
    ${({ leftBorderColor }) =>
      leftBorderColor ? leftBorderColor : palette('primary', 'divider')};
  padding-right: ${({ hasThumb }) => (hasThumb ? spacing(34) : spacing(5))};
  a {
    color: ${palette('primary', 'main')};
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const AttachmentsWrapper = styled.div``;

const AttachmentItem = (props: AttachmentItemProps) => {
  const { pretext, thumb_url, color, ...rest } = props;
  return (
    <Wrapper hasThumb={!!thumb_url} leftBorderColor={color}>
      <MarkDownView content={pretext} />
      <Body {...rest} />
      {thumb_url && <ThumbImageView src={thumb_url} />}
    </Wrapper>
  );
};

export { AttachmentItem, AttachmentItemProps, AttachmentsWrapper };
