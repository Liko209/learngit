import BasePresenter from '@/store/base/BasePresenter';
import { observable } from 'mobx';
import { service } from 'sdk';

const { SOCKET } = service;
export default class NoticePresenter extends BasePresenter {
  @observable connectState;
  @observable appState;
  constructor(connectState, appState) {
    super();
    this.connectState = connectState;
    this.appState = appState;
    // appState
    this.subscribeNotification(SOCKET.STATE_CHANGE, data => this.handleAppStateChange(data));
    // connectState
    this.subscribeNotification(SOCKET.NETWORK_CHANGE, data => this.handleNetworkStateChange(data));
  }

  handleAppStateChange({ state }) {
    this.appState = state;
  }

  handleNetworkStateChange({ state }) {
    this.connectState = state;
  }
}
