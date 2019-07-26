/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-04-16 10:17:30
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../../foundation/styled-components';
import { spacing } from '../../../foundation/utils';
import { ImageCard } from './style';
import { Wrapper as AttachmentItemWrapper } from '../../MessageInput/AttachmentItem';

type JuiFileWrapperProps = {
  children?: React.ReactNode;
};

const Wrapper = styled.div`
  margin-top: ${spacing(1)};
`;

const JuiFileSection = styled.div`
  ::after {
    content: '';
    display: block;
    clear: both;
  }
`;

const JuiFileImageSection = styled.div`
  display: flex;
  flex-wrap: wrap;

  ${ImageCard} {
    order: 1;
  }

  ${AttachmentItemWrapper} {
    width: 100%;
    order: 2;
  }
`;

const JuiFileWrapper = React.memo((props: JuiFileWrapperProps) => {
  const { children } = props;
  return <Wrapper>{children}</Wrapper>;
});

export {
  JuiFileWrapper,
  JuiFileSection,
  JuiFileImageSection,
  JuiFileWrapperProps,
};
