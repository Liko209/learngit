/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-17 16:07:00
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from 'styled-components';
import MuiTypography, { TypographyProps } from '@material-ui/core/Typography';
import JuiLink, { JuiLinkProps } from '../../atoms/Link';

import { grey, typography } from '../../utils/styles';

const TipsText = styled(MuiTypography)`
  && {
    color: ${grey('700')};
    ${typography('caption')};
    * {
      ${typography('caption')};
    }
  }
`;

type IProps = {
  text: string;
  linkText: string;
  href: string;
  TypographyProps?: TypographyProps;
  JuiLinkProps?: JuiLinkProps;
};

const JuiTextWithLink = (props: IProps) => {
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

export default JuiTextWithLink;
