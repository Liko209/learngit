/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:11:06
 * Copyright © RingCentral. All rights reserved.
 */
import React, { ComponentType, Fragment } from 'react';
import styled from '../../foundation/styled-components';
import { spacing } from '../../foundation/utils/styles';
import { JuiCircularProgress } from '../../components/Progress';

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

const withDelay = (Component: ComponentType<any>) => {
  class ComponentWithDelay extends React.Component<{ delay: number }> {
    static defaultProps = {
      delay: 0,
    };

    state = {
      visible: false,
    };

    timer: NodeJS.Timer;

    componentDidMount() {
      this.timer = setTimeout(() => {
        this.setState({ visible: true });
      },                      this.props.delay);
    }

    componentWillUnmount() {
      clearTimeout(this.timer);
    }

    render() {
      const { delay, ...rest } = this.props;
      if (!this.state.visible) return null;

      return <Component {...rest} />;
    }
  }
  return ComponentWithDelay;
};

const DefaultLoadingMoreWithDelay = withDelay(DefaultLoadingMore);

const withLoadingMore = (
  Component: ComponentType<any>,
  CustomizedLoading?: ComponentType<any>,
) => {
  const CustomizedLoadingWithDelay = CustomizedLoading
    ? withDelay(CustomizedLoading)
    : null;

  return class LoadingMoreComponent extends React.Component<
    WithLoadingMoreProps
  > {
    render() {
      const { loadingTop, loadingBottom, ...rest } = this.props;
      const LoadingMoreWithDelay =
        CustomizedLoadingWithDelay || DefaultLoadingMoreWithDelay;
      return (
        <Fragment>
          {loadingTop ? <LoadingMoreWithDelay /> : null}
          <Component {...rest} />
          {loadingBottom ? <LoadingMoreWithDelay /> : null}
        </Fragment>
      );
    }
  };
};

export { withLoadingMore, WithLoadingMoreProps };
