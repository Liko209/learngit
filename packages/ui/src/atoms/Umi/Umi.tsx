import React from 'react';
import styled from 'styled-components';
import { WithTheme } from '@material-ui/core';

type UmiProps = {
  className?: string;
  unreadCount?: number;
  important?: boolean;
  showCount?: boolean;
  onChange?: Function;
} & Partial<Pick<WithTheme, 'theme'>>;

const countToString = (unreadCount?: number) => {
  if (!unreadCount) {
    return '';
  }

  if (unreadCount > 99) {
    return '99+';
  }

  return String(unreadCount);
};

const TUmi = ({ className, unreadCount }: UmiProps) => {
  return (
    <div className={className}>
      <span>{countToString(unreadCount)}</span>
    </div>
  );
};

const styleWithNumber = `
  font-size: 12px;
  height: 16px;
  line-height: 16px;
  color: white;
`;

const styleWithoutNumber = `
  font-size: 0;
  height: 8px;
  line-height: 8px;
  color: transparent;
`;

const Umi = styled(TUmi)`
  div:hover > & > span {
    ${styleWithNumber}
  }

  span {
    display: block;
    padding: 0 4px;
    border-radius: 8px;
    margin-right: 2px;
    transition-property: font-size, height, line-height, color;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
    visibility: ${({ unreadCount }) => unreadCount ? 'visible' : 'hidden'};
    background: ${ ({ important }) => important ? '#ff8800' : '#69a3eb'};
    ${({ showCount }) => showCount ? styleWithNumber : styleWithoutNumber}
  }
`;

export { UmiProps, Umi };
export default Umi;
