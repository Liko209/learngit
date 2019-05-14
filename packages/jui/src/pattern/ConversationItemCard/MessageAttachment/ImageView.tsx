/*
 * @Author: isaac.liu
 * @Date: 2019-04-30 10:23:46
 * Copyright © RingCentral. All rights reserved.
 */
import styled from '../../../foundation/styled-components';
import { spacing, width, height } from '../../../foundation/utils';

const ImageView = styled.img`
  max-height: ${height(54)};
  border-radius: ${spacing(1.5)};
`;

type ImageViewProps = {
  imageURL?: string;
};

// thumb image

const ThumbImageView = styled.img`
  position: absolute;
  top: 0;
  margin: ${spacing(5, 5, 0, 0)};
  right: 0;
  width: ${width(20)};
  height: ${height(20)};
  border-radius: ${spacing(1)};
`;

export { ImageView, ImageViewProps, ThumbImageView };
