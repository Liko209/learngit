/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-02-26 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { ViewerViewProps } from './types';
import { ViewerTitle } from './Title';
import { ViewerContent } from './Content';
import { JuiViewerBackground } from 'jui/pattern/ImageViewer';
import ViewerContext from './ViewerContext';
import { Loading } from 'jui/hoc/withLoading';

@observer
class ViewerView extends Component<ViewerViewProps, any> {
  constructor(props: ViewerViewProps) {
    super(props);
    this.state = {
      contextValue: {
        show: true,
        closeViewer: this.closeViewer,
        onTransitionExited: this.onTransitionExited,
        onTransitionEntered: this.onTransitionEntered,
        onContentLoad: props.onContentLoad,
        onContentError: props.onContentError,
        isAnimating: true,
        setDeleteItem: this.setDeleteItem,
        setLoading: this.setLoading,
      },
      deleteItem: false,
      loading: false,
    };
  }

  componentWillUnmount() {
    this.props.stopPreload();
  }
  /* eslint-disable react/no-access-state-in-setstate */
  closeViewer = () => {
    this.setState({
      contextValue: {
        ...this.state.contextValue,
        show: false,
        isAnimating: true,
      },
    });
  };

  setDeleteItem = (value: boolean) => {
    this.setState({
      deleteItem: value,
    });
  };

  setLoading = (value: boolean) => {
    this.setState({ loading: value });
  };

  onTransitionEntered = () => {
    this.setState({
      contextValue: { ...this.state.contextValue, isAnimating: false },
    });
  };

  onTransitionExited = () => {
    this.props.viewerDestroyer();
  };

  async componentDidMount() {
    await this.props.init();
  }

  render() {
    const { contentLeftRender, ...rest } = this.props;
    return (
      <ViewerContext.Provider value={this.state.contextValue}>
        <Loading loading={this.state.loading}>
          <JuiViewerBackground
            data-test-automation-id="Viewer"
            show={this.state.contextValue.show}
          >
            <ViewerTitle {...rest} />
            <ViewerContent
              data-test-automation-id="ViewerContent"
              left={contentLeftRender({
                ...rest,
                deleteItem: this.state.deleteItem,
              })}
              right={<></>}
            />
          </JuiViewerBackground>
        </Loading>
      </ViewerContext.Provider>
    );
  }
}

export { ViewerView };
