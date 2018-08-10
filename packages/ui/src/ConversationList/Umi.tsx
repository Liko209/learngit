import React from 'react';
import styled from 'styled-components';
import { WithTheme } from '@material-ui/core';

type UmiProps = {
  className?: string;
  unreadCount?: number;
  important?: boolean;
  showNumber?: boolean;
  onChange?: Function;
} & Partial<Pick<WithTheme, 'theme'>>;

const TUmi = ({ className, unreadCount }: UmiProps) => {
  let str;
  if (unreadCount && unreadCount > 99) {
    str = '99+';
  } else {
    str = String(unreadCount);
  }
  return (<div className={className}><span>{str}</span></div>);
};

const Umi = styled(TUmi)`
  li:hover & span {
    font-size: 12px;
    line-height: 16px;
    height: 16px;
  }

  span {
    display: block;
    font-size: ${({ showNumber }: UmiProps) => showNumber ? '12px' : 0};
    line-height: ${({ showNumber }: UmiProps) => showNumber ? '16px' : '8px'};
    height: ${({ showNumber }: UmiProps) => showNumber ? '16px' : '8px'};
    padding: 0 4px;
    border-radius: 8px;
    margin-right: 2px;
    visibility: ${({ unreadCount }: UmiProps) => !!unreadCount ? 'visible' : 'hidden'};
    background: ${ ({ important }: UmiProps) => important ? '#ff8800' : '#69a3eb'};
    color: white;
    transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  }
`;

export { UmiProps, Umi };
export default Umi;
