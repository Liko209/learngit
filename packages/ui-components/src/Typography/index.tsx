/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-08-30 08:40:01
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from 'styled-components';
import MuiTypography, { TypographyProps } from '@material-ui/core/Typography';
import { WithTheme } from '@material-ui/core';

export type PageHeaderProps = {} & TypographyProps &
  Partial<Pick<WithTheme, 'theme'>>;

export const CustomTypography: React.SFC<PageHeaderProps> = (
  props: PageHeaderProps,
) => {
  return <MuiTypography {...props} />;
};

export const Typography = styled<PageHeaderProps>(CustomTypography).attrs({})``;

export default Typography;
