import BasePresenter from '@/store/base/BasePresenter';
import { action, observable } from 'mobx';
import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const Link = styled(NavLink)`
  &&{
    color: ${({ theme }) => theme.palette.grey[700]};
    text-decoration: none;
    font-size: ${({ theme }) => theme.typography.fontSize + 'px'};
  }
`;
// const SS = window.sessionStorage;
// const setItem = (key: string, value: any) => {
//   return SS.setItem(key, value);
// };
// const getItem = (key: string) => {
//   return SS.getItem(key);
// };
// const parse = JSON.parse;
export default class NavPresenter extends BasePresenter {
  @observable buttonPressTimer: any = 0;
  @observable menus:JSX.Element[] = [];
  @observable backNavArray: { url: string, urlTitle: string }[] = [];
  @observable forwardNavArray: { url: string, urlTitle: string }[] = [];

  @observable state = {
    title: 'Jupiter',
    time: 0,
    forwardDisabled: true,
    backDisabled: true,
    nav: '',
    prevUrl: '',
    pressNav: false,
    currentUrl: '',
    disabled: true,
    backNavArray: [],
    showLeftPanel: false,
    showRightPanel: false,
    isLongPress: false,
  };
  @action
  handleToward = (dir: string) => {
    const state = this.state;
    const { isLongPress, forwardDisabled, backDisabled } = state;
    const backNavArray = this.backNavArray;
    const forwardNavArray = this.forwardNavArray;
    let disable;
    let removedArr;
    let addArr;
    let action;
    let disableType;
    let emptyDisable;
    if (dir === 'forward') {
      disable = forwardDisabled;
      removedArr = forwardNavArray;
      addArr = backNavArray;
      action = () => {
        return window.history.forward();
      };
      disableType = 'backDisabled';
      emptyDisable = 'forwardDisabled';
    } else {
      disable = backDisabled;
      removedArr = backNavArray;
      addArr = forwardNavArray;
      action = () => {
        return window.history.back();
      };
      disableType = 'forwardDisabled';
      emptyDisable = 'backDisabled';
    }
    if (!isLongPress && !disable) {
      const REMOVEITEM = removedArr.shift(); // out stack
      REMOVEITEM && addArr.push(REMOVEITEM);
      action();
      this.backNavArray = backNavArray;
      this.forwardNavArray = forwardNavArray;
      state.pressNav = true;
      state[disableType] = false;
      if (!removedArr.length) {
        state[emptyDisable] = true;
      }
    } else {
      state.isLongPress = false;
    }
  }
  @action
  handleForward = () => {
    this.handleToward('forward');
  }
  @action
  handleBackWard = () => {
    this.handleToward('backward');
  }
  @action
  handleButtonPress = () => {
    const timer = 300;
    this.buttonPressTimer = setTimeout(() => {
      this.state.time = timer;
    },                                 timer);
  }
  @action
  handleButtonRelease = (evt: React.TouchEvent|React.MouseEvent, nav: string) => {
    // click will trigger also
    clearTimeout(this.buttonPressTimer);
    const state = this.state;
    const time = state.time;
    const backNavArray = this.backNavArray;
    const forwardNavArray = this.forwardNavArray;
    if (time > 200) {
      state.nav = nav;
      state.time = 0;
      state.isLongPress = true;
      if (nav === 'backward') {
        state.showLeftPanel = true;
        this.backNavArray = backNavArray.reverse();
        this.handleMenuItem(this.backNavArray);
      }else {
        state.showRightPanel = true;
        this.forwardNavArray = forwardNavArray.reverse();
        this.handleMenuItem(this.forwardNavArray);
      }
    } else {
      state.showRightPanel = false;
      state.showLeftPanel = false;
      state.isLongPress = false;
    }
  }
  @action
  handleMenuItem = (navArray: {url: string, urlTitle: string}[]) => {
    const menus = navArray && navArray.map((item, idx) => {
      return <Link key={idx} to={item!.url}>{item!.urlTitle}</Link>;
    });
    this.menus = menus;
  }
  @action
  handleNavClose = (event: React.ChangeEvent|React.TouchEvent|React.MouseEvent<HTMLElement>, index: number|undefined) => {
    const state = this.state;
    const { nav, title, currentUrl } = state;
    // current title
    const currentItem = { urlTitle: title, url: currentUrl };
    let backNavArray = this.backNavArray;
    let forwardNavArray = this.forwardNavArray;
    // const { forwardNavArray } = this.state;
    if (nav === 'backward' && index !== undefined) {
      const toForward = backNavArray.splice(0, index + 1); // delete current and before
      toForward.splice(toForward.length - 1, 1); // delete click items
      forwardNavArray = toForward.concat(currentItem);
      this.handleMenuItem(forwardNavArray.reverse());
      this.backNavArray = backNavArray;
      this.forwardNavArray = forwardNavArray;
      state.showLeftPanel = false;
      if (!backNavArray.length) {
        state.backDisabled = true;
      }
      if (forwardNavArray.length) {
        state.forwardDisabled = false;
      }
    } else if (nav === 'forward' && index !== undefined) {
      const toBack = forwardNavArray.splice(0, index + 1);
      toBack.splice(toBack.length - 1, 1);
      backNavArray = toBack.concat(currentItem);
      this.handleMenuItem(backNavArray.reverse());
      this.backNavArray = backNavArray;
      this.forwardNavArray = forwardNavArray;
      state.showRightPanel = false;
      if (!forwardNavArray.length) {
        state.forwardDisabled = true;
      }
      if (backNavArray.length) {
        state.backDisabled = false;
      }
    }
    state.showRightPanel = false;
    state.showLeftPanel = false;
  }
  handleTitle  = (title: string) => {
    this.state.title = title;
  }
  handleRouterChange = () => {
    this.state.pressNav = false;
  }
}
