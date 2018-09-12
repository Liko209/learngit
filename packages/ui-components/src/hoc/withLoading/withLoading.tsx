import React, { ComponentType } from 'react';
import { JuiCircularProgress } from '../../atoms/CircularProgress';
import styled from '../../styled-components';

type WithLoadingProps = {
  loading: boolean;
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
  return ({ loading, variant, ...props }: WithLoadingProps) => {
    if (!loading) return <Component {...props} />;

    const Loading = CustomizedLoading || MAP[variant || 'circular'];
    return <Loading />;
  };
};

export { withLoading, WithLoadingProps };
