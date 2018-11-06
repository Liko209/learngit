/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:11:03
 * Copyright © RingCentral. All rights reserved.
 */
import React, { ComponentType, Fragment } from 'react';
import styled from '../../foundation/styled-components';
import { JuiCircularProgress } from '../../components/Progress';
import { JuiFade } from '../../components/Fade';

type WithLoadingProps = {
  loading: boolean;
  transitionDelay?: number;
  variant?: 'circular';
};
type TStyledLoading = {
  isVisible: Boolean;
};
const StyledLoading = styled.div<TStyledLoading>`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  pointer-events: none;
  justify-content: center;
  background: ${({ isVisible, theme }) =>
    isVisible ? theme.palette && theme.palette.common.white : 'transparent'};
  z-index: ${({ theme }) => theme.zIndex && theme.zIndex.drawer};
`;

const DefaultLoading = (props: any) => {
  return (
    <Fragment>
      <StyledLoading isVisible={props.isVisible}>
        <JuiFade in={props.isVisible}>
          <div>
            <JuiCircularProgress />
          </div>
        </JuiFade>
      </StyledLoading>
      {props.children}
    </Fragment>
  );
};

const MAP = {
  circular: DefaultLoading,
};

const withLoading = <P extends object>(
  Component: ComponentType<P>,
  CustomizedLoading?: ComponentType<any>,
): React.SFC<P & WithLoadingProps> => {
  return ({
    loading,
    variant,
    transitionDelay = 0,
    ...props
  }: WithLoadingProps) => {
    const Loading = CustomizedLoading || MAP[variant || 'circular'];
    return (
      <Loading transitionDelay={transitionDelay} isVisible={loading}>
        <Component {...props} />
      </Loading>
    );
  };
};

export { withLoading, WithLoadingProps };
