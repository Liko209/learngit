/*
 * @Author: isaac.liu
 * @Date: 2019-04-25 08:51:33
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../../foundation/styled-components';
import uuid from 'uuid';
import { typography } from '../../../foundation/utils';
import {
  AttachmentItem,
  AttachmentItemProps,
  AttachmentsWrapper,
} from './AttachmentItem';

type JuiMessageAttachmentProps = {
  icon?: string;
  attachments?: AttachmentItemProps[];
};

const Wrapper = styled.div`
  ${typography('body1')};
`;

const JuiMessageAttachment = (props: JuiMessageAttachmentProps) => {
  const { attachments = [] } = props;
  return (
    <Wrapper>
      {attachments.length > 0 && (
        <AttachmentsWrapper>
          {attachments.map((item: AttachmentItemProps) => (
            <AttachmentItem {...item} key={uuid.v1()} />
          ))}
        </AttachmentsWrapper>
      )}
    </Wrapper>
  );
};

export { JuiMessageAttachment };
