import { Theme } from '../styles';
import { css, keyframes } from '../styled-components';

function ellipsis() {
  return css`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
  `;
}

function lineClamp(lineNumber: number, maxHeight: number) {
  return css`
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: ${lineNumber};
    -webkit-box-orient: vertical;
    max-height: ${maxHeight};
    word-break: break-word;
  `;
}

const rippleEnter = (theme: Theme) => keyframes`
  from {
    transform: scale(0);
    opacity: 0.1;
  }
  to {
    transform: scale(1);
    opacity: ${theme.opacity[5]};
  }
`;

export { ellipsis, lineClamp, rippleEnter };
