/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-03-01 14:45:55
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../../foundation/styled-components';
import {
  typography,
  ellipsis,
  spacing,
  palette,
  width,
} from '../../../foundation/utils/styles';

const JuiDialogHeaderMeta = styled.div`
  display: flex;
  align-items: center;
  margin-right: ${spacing(4)};
`;

const JuiDialogHeaderMetaLeft = styled.div``;

const DialogHeaderMetaRightTitle = styled.h3`
  ${typography('body1')};
  color: ${palette('grey', '900')};
  margin: 0;
  ${ellipsis()};
`;

const DialogHeaderMetaRightSubtitle = styled.h4`
  ${typography('caption1')};
  color: ${palette('grey', '500')};
  margin: 0;
  ${ellipsis()};
`;

type JuiDialogHeaderMetaRightProps = {
  title: string;
  subtitle: string;
};

const DialogHeaderMetaRight = ({
  title,
  subtitle,
  ...rest
}: JuiDialogHeaderMetaRightProps) => (
  <div {...rest}>
    <DialogHeaderMetaRightTitle>{title}</DialogHeaderMetaRightTitle>
    <DialogHeaderMetaRightSubtitle>{subtitle}</DialogHeaderMetaRightSubtitle>
  </div>
);
const JuiDialogHeaderMetaRight = styled<JuiDialogHeaderMetaRightProps>(
  DialogHeaderMetaRight,
)`
  margin-left: ${spacing(2)};
  max-width: ${width(40)};
  @media screen and (max-width: 640px) {
    display: none;
  }
`;

export {
  JuiDialogHeaderMeta,
  JuiDialogHeaderMetaLeft,
  JuiDialogHeaderMetaRight,
  JuiDialogHeaderMetaRightProps,
};
