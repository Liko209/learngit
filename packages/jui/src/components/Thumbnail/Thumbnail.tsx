/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-01-08 10:29:42
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from 'styled-components';
import { width, shape } from '../../foundation/utils/styles';
import pdf from '../../assets/pdf_conversation_xxh.png';
import ppt from '../../assets/ppt_conversation_xxh.png';
import ps from '../../assets/ps_conversation_xxh.png';
import sheet from '../../assets/sheet_conversation_xxh.png';
import defaultIcon from '../../assets/default.svg';

const ICON_MAP = {
  pdf,
  ppt,
  ps,
  sheet,
};

type JuiThumbnailProps = {
  size?: 'small' | 'large';
  url?: string | undefined;
};

const StyledThumbnail = styled<JuiThumbnailProps, 'div'>('div')`
  width: ${({ size }) => (size === 'small' ? width(5) : width(9))};
  height: ${({ size }) => (size === 'small' ? width(5) : width(9))};
  border-radius: ${({ size }) =>
    size === 'small' ? shape('borderRadius', 0.5) : shape('borderRadius')};
  background-image: url(${({ url }) =>
    url ? (ICON_MAP.hasOwnProperty(url) ? ICON_MAP[url] : url) : defaultIcon});
  background-size: cover;
`;

const JuiThumbnail = (props: JuiThumbnailProps) => {
  return <StyledThumbnail {...props} />;
};

export { JuiThumbnail };
