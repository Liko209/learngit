/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:11:03
 * Copyright © RingCentral. All rights reserved.
 */
import React, { ComponentType } from 'react';
import { JuiCircularProgress } from '../../atoms/CircularProgress';
import { JuiFade } from '../../atoms/Fade';
import styled from '../../styled-components';

type WithLoadingProps = {
  loading: boolean;
  delay?: number;
  variant?: 'circular';
};

const StyledLoading = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const DefaultLoading = () => (
  <StyledLoading>
    <JuiCircularProgress />
  </StyledLoading>
);

const MAP = {
  circular: DefaultLoading,
};

const withLoading = <P extends object>(
  Component: ComponentType<P>,
  CustomizedLoading?: ComponentType<any>,
): React.SFC<P & WithLoadingProps> => {
  return ({ loading, variant, delay = 0, ...props }: WithLoadingProps) => {
    if (!loading) return <Component {...props} />;

    const Loading = CustomizedLoading || MAP[variant || 'circular'];

    return (
      <JuiFade in={true} style={{ transitionDelay: `${delay}ms` }}>
        <Loading />
      </JuiFade>
    );
  };
};

export { withLoading, WithLoadingProps };
