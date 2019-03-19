/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-17 16:07:00
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';
import styled from '../../foundation/styled-components';
import MuiTypography, { TypographyProps } from '@material-ui/core/Typography';
import JuiLink, { JuiLinkProps } from '../Link';

import { grey, typography } from '../../foundation/utils/styles';

const TipsText = styled(MuiTypography)`
  && {
    color: ${grey('700')};
    ${typography('caption1')};
    * {
      ${typography('caption1')};
    }
  }
`;

type Props = {
  text: string;
  linkText: string;
  onClick?: (event: React.MouseEvent<HTMLSpanElement>) => void;
  TypographyProps?: TypographyProps;
  JuiLinkProps?: JuiLinkProps;
};

const JuiTextWithLink = memo((props: Props) => {
  const { text, linkText, onClick, TypographyProps, JuiLinkProps } = props;
  let textProps;
  if (TypographyProps) {
    const { innerRef, ...rest } = TypographyProps;
    textProps = rest;
  }

  return (
    <TipsText {...textProps}>
      {text}
      <JuiLink handleOnClick={onClick} {...JuiLinkProps}>
        {linkText}
      </JuiLink>
    </TipsText>
  );
});

export { JuiTextWithLink };
