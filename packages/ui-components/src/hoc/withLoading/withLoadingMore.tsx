import React, { ComponentType, Fragment } from 'react';
import styled from '../../styled-components';
import { spacing } from '../../utils/styles';
import { JuiCircularProgress } from '../../atoms/CircularProgress';

type WithLoadingMoreProps = {
  loadingTop: boolean;
  loadingBottom: boolean;
  children: JSX.Element;
};

const StyledLoadingMore = styled.div`
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

const withLoadingMore = (
  Component: ComponentType<any>,
  CustomizedLoading?: ComponentType<any>,
) => {
  return class LoadingMoreComponent extends React.Component<any> {
    render() {
      const { loadingTop, loadingBottom, ...rest } = this.props;
      const LoadingMore = CustomizedLoading || DefaultLoadingMore;
      return (
        <Fragment>
          {loadingTop ? <LoadingMore /> : null}
          <Component {...rest}>{rest.children}</Component>
          {loadingBottom ? <LoadingMore /> : null}
        </Fragment>
      );
    }
  };
};

export { withLoadingMore, WithLoadingMoreProps };
