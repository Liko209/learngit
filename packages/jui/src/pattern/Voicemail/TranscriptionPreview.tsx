import React from 'react';
import { withTheme } from 'styled-components';
import ReactContentLoader from 'react-content-loader';
import styled from '../../foundation/styled-components';
import { ThemeProps } from '../../foundation/theme/theme';
import { lineClamp } from '../../foundation/utils/styles';
import { JuiIconography } from '../../foundation/Iconography';

type JuiTranscriptionPreviewProps = ThemeProps & {
  children: React.ReactNode;
  isLoading: boolean;
  isMini: boolean;
};

const StyledTranscriptionPreview = styled('div')`
  width: 200px;
  ${lineClamp(2, 10)};
`;

const Wrapper = styled.div`
  height: 100%;
`;

const TranscriptionPreview = (props: JuiTranscriptionPreviewProps) => {
  const {
    isLoading,
    isMini,
    children,
    theme: {
      size: { width, height },
    },
  } = props;
  if (isMini) {
    return (
      <JuiIconography iconColor={['grey', '900']}>star</JuiIconography>
    );
  }

  if (isLoading) {
    return (
      <Wrapper>
        <JuiIconography iconColor={['grey', '900']}>star</JuiIconography>
        <ReactContentLoader
          style={{ width: '100%', height: `${67 * height}px` }}
          width={67 * width}
          height={67 * height}
        >
          <rect
            x={`${4 * width}`}
            y={`${2.5 * height}`}
            rx={width}
            ry={height}
            width={`${42 * width}`}
            height={`${7 * height}`}
          />
        </ReactContentLoader>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <JuiIconography iconColor={['grey', '900']}>star</JuiIconography>
      <StyledTranscriptionPreview>
        {children}
      </StyledTranscriptionPreview>
    </Wrapper>
  );
};

const JuiTranscriptionPreview = withTheme(TranscriptionPreview);

export { JuiTranscriptionPreview };
