import React, { Component } from 'react';
import _ from 'lodash';
import { observer } from 'mobx-react';
import Span from './Span';
import NoticePresenter from './noticePresenter';

@observer
class NotificationBanner extends Component {
  constructor(props) {
    super(props);
    this.presenter = new NoticePresenter();
    this.handleClick = this.handleClick.bind(this);
    this.bannerText = this.bannerText.bind(this);
  }

  componentWillUnmount() {
    this.presenter.dispose();
  }

  handleClick() {
    // TODO
  }

  bannerText() {
    const indicatableAppStates = ['connecting', 'idle', 'disconnected'];
    const { connectState, appState } = this.presenter;
    return (
      (connectState === 'offline' && connectState) ||
      (indicatableAppStates.includes(appState) && appState)
    );
  }

  render() {
    const bannerText = this.bannerText();
    const render = bannerText ? (
      <div>
        <Span>{_.upperFirst(bannerText)}</Span>
      </div>
    ) : null;

    return render;
  }
}

NotificationBanner.defaultProps = {
  appState: '',
  connectState: ''
};

export default NotificationBanner;
