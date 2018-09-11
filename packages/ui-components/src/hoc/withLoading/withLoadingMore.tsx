import React, { ComponentType } from 'react';
import styled from '../../styled-components';
import { spacing } from '../../utils/styles';
import { JuiCircularProgress } from '../../atoms/CircularProgress';

type WithLoadingMoreProps = {
  loadingMore: boolean;
  children: JSX.Element;
};

const StyledLoadingMore = styled.li`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: ${spacing(15, 0)};
`;

const DefaultLoadingMore = () => (
  <StyledLoadingMore>
    <JuiCircularProgress />
  </StyledLoadingMore>
);

const withLoadingMore = <P extends object>(
  Component: ComponentType<P>,
  CustomizedLoading?: ComponentType<any>,
): React.SFC<P & WithLoadingMoreProps> => {
  return ({ loadingMore, ...props }: WithLoadingMoreProps) => {
    const LoadingMore = CustomizedLoading || DefaultLoadingMore;
    return (
      <Component {...props}>
        {loadingMore ? <LoadingMore /> : null}
        {props.children}
      </Component>
    );
  };
};

export { withLoadingMore, WithLoadingMoreProps };
