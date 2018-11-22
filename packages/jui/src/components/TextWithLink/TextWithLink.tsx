/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-17 16:07:00
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from 'styled-components';
import MuiTypography, { TypographyProps } from '@material-ui/core/Typography';
import JuiLink, { JuiLinkProps } from '../Link';

import { grey, typography } from '../../foundation/utils/styles';

const TipsText = styled(MuiTypography)`
  && {
    color: ${grey('700')};
    ${typography('caption')};
    * {
      ${typography('caption')};
    }
  }
`;

type Props = {
  text: string;
  linkText: string;
  href?: string;
  onClick?: Function;
  TypographyProps?: TypographyProps;
  JuiLinkProps?: JuiLinkProps;
};

const JuiTextWithLink = (props: Props) => {
  const { text, linkText, href, TypographyProps, JuiLinkProps } = props;
  let textProps;
  if (TypographyProps) {
    const { innerRef, ...rest } = TypographyProps;
    textProps = rest;
  }

  return (
    <TipsText {...textProps}>
      {text}
      <JuiLink href={href} {...JuiLinkProps}>
        {linkText}
      </JuiLink>
    </TipsText>
  );
};

export { JuiTextWithLink };
