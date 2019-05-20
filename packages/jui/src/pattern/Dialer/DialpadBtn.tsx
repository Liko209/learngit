/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-05-02 17:23:23
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { JuiFabButton } from '../../components/Buttons';
import styled, { keyframes, css } from '../../foundation/styled-components';
import tinycolor from 'tinycolor2';
import { spacing, palette } from '../../foundation/utils';

const blink = ({
  theme,
  colorScope = 'common',
  colorName = 'white',
}: any) => keyframes`
  0%{
    color:${theme.palette.getContrastText(
      palette(colorScope, colorName)({ theme }),
    )}
  }
  30%{
    color:${theme.palette.getContrastText(
      palette(colorScope, colorName)({ theme }),
    )}
  }
  60%{
    color:${tinycolor(
      theme.palette.getContrastText(palette(colorScope, colorName)({ theme })),
    )
      .setAlpha(0.5)
      .toRgbString()}
  }
  80%{
    color:${tinycolor(
      theme.palette.getContrastText(palette(colorScope, colorName)({ theme })),
    )
      .setAlpha(0.5)
      .toRgbString()}
  }
  100%{
    color:${theme.palette.getContrastText(
      palette(colorScope, colorName)({ theme }),
    )}
  }
`;

const blinkAnimation = () =>
  css`
    ${blink} 1s ease-in-out;
  `;

type JuiDialpadBtnProps = {
  shouldAnimationStart: boolean;
  id: string;
  ariaLabel: string;
  onClick: () => void;
  tooltipTitle: string;
};

const JuiDialpadBtn = ({
  shouldAnimationStart,
  id,
  ariaLabel,
  onClick,
  tooltipTitle,
}: JuiDialpadBtnProps) => {
  const StyleContainer = styled.div`
    && {
      margin-right: ${spacing(3)};

      button {
        animation: ${shouldAnimationStart ? blinkAnimation : undefined};
      }
    }
  `;

  return (
    <StyleContainer aria-label={ariaLabel}>
      <JuiFabButton
        size="medium"
        iconName="dialer"
        disableRipple={true}
        onClick={onClick}
        tooltipTitle={tooltipTitle}
        data-test-automation-id="telephony-dialpad-btn"
        id={id}
      />
    </StyleContainer>
  );
};

export { JuiDialpadBtn };
