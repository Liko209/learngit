/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-05-29 15:11:34
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { withTheme } from 'styled-components';
import ReactContentLoader from 'react-content-loader';
import styled from '../../foundation/styled-components';
import { ThemeProps } from '../../foundation/theme/theme';
import {
  lineClamp,
  spacing,
  grey,
  typography,
  height,
  width,
} from '../../foundation/utils/styles';
import { JuiIconography } from '../../foundation/Iconography';

type JuiTranscriptionPreviewProps = {
  isLoading: boolean;
  showPreivew: boolean;
  transcription: string;
};

type JuiTranscriptionDetailsProps = {
  transcription: string;
};

const JuiTranscriptionWrapper = styled.div`
  height: 100%;
  align-items: center;
  display: inline-flex;
`;

const JuiTranslationSummaryWrapper = styled.div`
  height: 100%;
  align-items: center;
  display: inline-flex;
  margin-left: ${spacing(3)};
`;

const JuiTranslationContent = styled.div`
  color: ${grey('600')};
  ${typography('body1')};
  line-height: ${height(4)};
  max-width: ${width(44)};
  ${lineClamp(2, 10)};
  margin-left: ${spacing(4)};
`;

const JuiTranslationSummaryContent = styled.div`
  color: ${grey('600')};
  ${typography('body1')};
  margin-left: ${spacing(6)};
`;

const JuiTranscriptionIcon = () => (
  <JuiIconography iconColor={['grey', '500']} iconSize="medium">
    transcription
  </JuiIconography>
);

const StyledReactContentLoader = styled(ReactContentLoader)`
  margin-left: ${spacing(4)};
`;

const TranscriptionLoading = (props: ThemeProps) => {
  const {
    theme: {
      size: { width, height },
    },
  } = props;

  return (
    <StyledReactContentLoader
      style={{ width: `${44 * width}`, height: `${8 * height}px` }}
      width={44 * width}
      height={8 * height}
    >
      <rect
        x="0"
        y={width}
        rx="2"
        ry="2"
        width={`${44 * width}`}
        height={`${2 * height}`}
      />
      <rect
        x="0"
        y={`${5 * width}`}
        rx="2"
        ry="2"
        width={`${29 * width}`}
        height={`${2 * height}`}
      />
    </StyledReactContentLoader>
  );
};

const JuiTranscriptionLoading = withTheme(TranscriptionLoading);

class JuiTranscriptionPreview extends Component<JuiTranscriptionPreviewProps> {
  render() {
    const { showPreivew, transcription, isLoading } = this.props;

    return (
      <JuiTranscriptionWrapper>
        <JuiTranscriptionIcon />
        {isLoading && <JuiTranscriptionLoading />}
        {!isLoading && showPreivew && (
          <JuiTranslationContent>{transcription}</JuiTranslationContent>
        )}
      </JuiTranscriptionWrapper>
    );
  }
}

class JuiTranscriptionDetails extends Component<JuiTranscriptionDetailsProps> {
  render() {
    const { transcription } = this.props;
    return (
      <JuiTranslationSummaryWrapper>
        <JuiTranscriptionIcon />
        <JuiTranslationSummaryContent>
          {transcription}
        </JuiTranslationSummaryContent>
      </JuiTranslationSummaryWrapper>
    );
  }
}

export { JuiTranscriptionDetails, JuiTranscriptionPreview };
