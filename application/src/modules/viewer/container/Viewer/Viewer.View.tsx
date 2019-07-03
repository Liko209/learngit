/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-02-26 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { ViewerViewProps, ViewerViewModelProps } from './types';
import { ViewerTitle } from './Title';
import { ViewerContent } from './Content';
import { JuiViewerBackground } from 'jui/pattern/ImageViewer';
import ViewerContext from './ViewerContext';

@observer
class ViewerView extends Component<
  ViewerViewProps & ViewerViewModelProps,
  any
> {
  constructor(props: ViewerViewProps & ViewerViewModelProps) {
    super(props);
    this.state = {
      contextValue: {
        show: true,
        closeViewer: this.closeViewer,
        onTransitionExited: this.onTransitionExited,
        onTransitionEntered: this.onTransitionEntered,
        isAnimating: true,
        setDeleteItem: this.setDeleteItem,
      },
      deleteItem: false,
    };
  }

  componentWillUnmount() {
    this.props.stopPreload();
  }

  closeViewer = () => {
    this.setState({
      contextValue: {
        ...this.state.contextValue,
        show: false,
        isAnimating: true,
      },
    });
  }

  setDeleteItem = (value: boolean) => {
    this.setState({
      deleteItem: value,
    });
  }

  onTransitionEntered = () => {
    this.setState({
      contextValue: { ...this.state.contextValue, isAnimating: false },
    });
  }

  onTransitionExited = () => {
    this.props.viewerDestroyer();
  }

  async componentDidMount() {
    await this.props.init();
  }

  render() {
    const { contentLeftRender, ...rest } = this.props;
    return (
      <ViewerContext.Provider value={this.state.contextValue}>
        <JuiViewerBackground
          data-test-automation-id="Viewer"
          show={this.state.contextValue.show}
        >
          <ViewerTitle itemId={rest.itemId} {...rest} />
          <ViewerContent
            data-test-automation-id="ViewerContent"
            left={contentLeftRender({
              ...rest,
              deleteItem: this.state.deleteItem,
            })}
            right={<></>}
          />
        </JuiViewerBackground>
      </ViewerContext.Provider>
    );
  }
}

export { ViewerView };
