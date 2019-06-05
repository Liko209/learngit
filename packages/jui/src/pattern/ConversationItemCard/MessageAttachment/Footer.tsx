/*
 * @Author: isaac.liu
 * @Date: 2019-04-30 09:43:27
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import styled from '../../../foundation/styled-components';
import { spacing, typography } from '../../../foundation/utils';
import { ImageWithSize, Span } from './base';
import moment from 'moment';

type FooterProps = {
  footer?: string;
  ts?: string;
  footer_icon?: string;
};

const Wrapper = styled.div`
  margin-top: ${spacing(5)};
  display: flex;
  align-items: center;
  color: #9f9f9f;
  ${typography('caption1')};
`;

const Icon = ImageWithSize(6);

const Footer = (props: FooterProps) => {
  const { footer, footer_icon, ts } = props;
  const icon = footer_icon;
  if (footer || icon) {
    const timestamp = moment(ts).format('YYYY-MM-DD HH:mm:ss');
    return (
      <Wrapper>
        {icon && <Icon src={icon} />}
        {footer && <Span>{footer}</Span>}
        {ts && <Span>{timestamp}</Span>}
      </Wrapper>
    );
  }
  return null;
};

export { Footer, FooterProps };
