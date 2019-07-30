/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-07-29 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */
import styled from '../../foundation/styled-components';
import { spacing, palette } from '../../foundation/utils';

const JuiEditPhotoUploadContent = styled.div`
  margin: ${spacing(5, 0)};
  display: flex;
  > button {
    margin: 0 auto;
  }
`;

const JuiEditPhotoImageContent = styled.div`
  height: ${spacing(86)};
  background-color: ${palette('common', 'black')};
  margin: ${spacing(0, -6)};
`;

const JuiEditPhotoSliderContent = styled.div`
  margin: ${spacing(5, 0, 0)};
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  > span {
    width: ${spacing(80)};
  }
`;

const JuiEditPhotoSliderLeftText = styled.div`
  display: inline-block;
  white-space: nowrap;
  margin-right: ${spacing(4.5)};
`;

export {
  JuiEditPhotoUploadContent,
  JuiEditPhotoImageContent,
  JuiEditPhotoSliderContent,
  JuiEditPhotoSliderLeftText,
};
