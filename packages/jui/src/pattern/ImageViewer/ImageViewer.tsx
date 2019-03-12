/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2018-3-5 15:19:02
 * Copyright © RingCentral. All rights reserved.
 */
import { JuiFabButton } from '../../components/Buttons';
import { width, height } from '../../foundation/utils/styles';
import styled from '../../foundation/styled-components';

const JuiImageViewerContainer = styled.div`
  && .zoomGroup {
    opacity: 0;
    transition: opacity 0.3s;
  }
  position: relative;
  width: 100%;
  height: 100%;
  :hover button,
  :hover .zoomGroup {
    opacity: 1;
    transition: opacity 0.3s;
  }
`;

const JuiImageViewerPreviousButton = styled(JuiFabButton)`
  && {
    position: absolute;
    left: ${width(6)};
    top: 50%;
    transform: translateY(-50%);
    opacity: 0;
    transition: opacity 0.3s;
  }
`;

const JuiImageViewerForwardButton = styled(JuiFabButton)`
  && {
    position: absolute;
    right: ${height(6)};
    top: 50%;
    transform: translateY(-50%);
    opacity: 0;
    transition: opacity 0.3s;
  }
`;
export {
  JuiImageViewerContainer,
  JuiImageViewerPreviousButton,
  JuiImageViewerForwardButton,
};
