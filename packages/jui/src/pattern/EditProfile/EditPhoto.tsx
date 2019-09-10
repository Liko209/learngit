/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-07-29 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */
import styled from '../../foundation/styled-components';
import { spacing, palette, grey } from '../../foundation/utils';

const JuiEditPhotoUploadContent = styled.div`
  margin: ${spacing(5, 0)};
  display: flex;
  > button {
    margin: 0 auto;
  }
`;

const JuiEditPhotoEditContent = styled.div`
  position: relative;
  height: ${spacing(86)};
  background-color: ${grey('900')};
  margin: ${spacing(0, -6)};
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

const JuiEditPhotoImageContent = styled.div<{ canDrag?: boolean }>`
  && {
    text-align: center;
    display: table-cell;
    vertical-align: middle;
    position: relative;
    pointer-events: none;
    img {
      pointer-events: none;
    }
  }
`;

const JuiEditPhotoImageCanNotEdit = styled.div`
  &&&& {
    overflow: hidden;
    pointer-events: none;
  }
  div {
    pointer-events: none;
  }
`;

const JuiEditPhotoImageEditContent = styled.div`
  position: relative;
  z-index: 2;
  && div {
    overflow: visible;
    border-radius: 50%;
  }
  > div {
    height: ${spacing(70)};
    width: ${spacing(70)};
  }
  img {
    background-color: ${grey('100')};
  }
`;

const JuiEditPhotoContentMask = styled.div`
  position: absolute;
  border: ${spacing(57)} solid ${palette('common', 'black', 0.3)};
  height: ${spacing(70)};
  width: ${spacing(70)};
  border-radius: 50%;
  pointer-events: none;
  z-index: 10;
`;

const JuiEditPhotoSliderContent = styled.div`
  margin: ${spacing(5, 0, 0)};
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  > span {
    width: ${spacing(80)};
    z-index: 10;
  }
`;

const JuiEditPhotoSliderLeftText = styled.div`
  display: inline-block;
  white-space: nowrap;
  margin-right: ${spacing(4.5)};
`;

const JuiEditPhotoZoomCover = styled.div<{ canDrag?: boolean }>`
  cursor: ${({ canDrag }) => (canDrag ? 'move' : 'default')};
  position: absolute;
  height: ${spacing(70)};
  width: ${spacing(70)};
  pointer-events: auto;
  left: 50%;
  top: 50%;
  margin: ${spacing(-35, 0, 0, -35)};
`;

export {
  JuiEditPhotoUploadContent,
  JuiEditPhotoEditContent,
  JuiEditPhotoSliderContent,
  JuiEditPhotoSliderLeftText,
  JuiEditPhotoImageContent,
  JuiEditPhotoImageEditContent,
  JuiEditPhotoContentMask,
  JuiEditPhotoImageCanNotEdit,
  JuiEditPhotoZoomCover,
};
