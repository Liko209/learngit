import { action, observable } from 'mobx';
import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const Link = styled(NavLink)`
  &&{
    color: ${({ theme }) => theme.palette.grey[700]};
    text-decoration: none;
    font-size: ${({ theme }) => theme.typography.fontSize}px;
  }
`;
const SS = window.sessionStorage;
const parse = JSON.parse;
class NavPresenter {
  getItem = (key: string) => {
    return SS.getItem(key) || '[]';
  }
  setItem = (key: string, value: any) => {
    return SS.setItem(key, value);
  }
  @observable buttonPressTimer: any = 0;
  @observable menus:JSX.Element[] = [];
  @observable backNavArray: { url: string, urlTitle: string }[] = parse(this.getItem('backNavArray'));
  @observable forwardNavArray: { url: string, urlTitle: string }[] = parse(this.getItem('forwardNavArray'));
  @observable counts: number = 0;
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
    showLeftPanel: false,
    showRightPanel: false,
    isLongPress: false,
  };
  @action
  private _handleToward = (dir: string) => {
    const state = this.state;
    const { isLongPress, forwardDisabled, backDisabled, title, currentUrl } = state;
    const backNavArray = this.backNavArray;
    const forwardNavArray = this.forwardNavArray;
    // current title
    const currentItem = { urlTitle: title, url: currentUrl };
    let disable;
    let removedArr;
    let addArr;
    let action;
    let disableType;
    let emptyDisable;
    if (dir === 'forward') {
      disable = forwardDisabled;
      removedArr = (function () {
        return forwardNavArray.reverse();
      })();
      addArr = backNavArray;
      action = () => {
        return window.history.go(-1);
      };
      disableType = 'backDisabled';
      emptyDisable = 'forwardDisabled';
    } else {
      disable = backDisabled;
      removedArr = (function () {
        return backNavArray.reverse();
      })();
      addArr = forwardNavArray;
      action = () => {
        return window.history.back();
      };
      disableType = 'forwardDisabled';
      emptyDisable = 'backDisabled';
    }
    if (!isLongPress && !disable) {
      const REMOVED_ITEM = removedArr.shift(); // out stack
      REMOVED_ITEM && addArr.push(currentItem);
      action();
      this.forwardNavArray = dir === 'forward' ? removedArr : addArr;
      this.backNavArray = dir === 'forward' ? addArr : removedArr; // reversed
      this.setItem('backNavArray', JSON.stringify(removedArr));
      this.setItem('forwardNavArray', JSON.stringify(addArr));
      state.pressNav = true;
      state[disableType] = false;
      if (!removedArr.length) {
        state[emptyDisable] = true;
      }
    } else {
      state.isLongPress = false;
    }
  }
  // @action
  // handleForward = () => {
  //   const { isLongPress, forwardDisabled, title, currentUrl } = this.state;
  //   const backNavArray = this.backNavArray;
  //   const forwardNavArray = this.forwardNavArray;
  //   const currentItem = { urlTitle: title, url: currentUrl };
  //   if (!isLongPress && !forwardDisabled) {
  //     const reversedArr = (function () {
  //       return forwardNavArray.reverse();
  //     })();
  //     console.log('reversedArr');
  //     console.log(reversedArr);
  //     const REMOVE_ITEM = reversedArr.shift(); // out stack
  //     REMOVE_ITEM && backNavArray.push(currentItem);
  //     this.backNavArray = backNavArray;
  //     this.forwardNavArray = reversedArr;
  //     window.history.forward();
  //     this.state.pressNav = true;
  //     this.state.backDisabled = false;
  //     this.setItem('backNavArray', JSON.stringify(backNavArray));
  //     this.setItem('forwardNavArray', JSON.stringify(reversedArr));
  //     if (!forwardNavArray.length) {
  //       this.state.forwardDisabled = true;
  //     }
  //   } else {
  //     this.state.isLongPress = false;
  //   }
  // }
  // @action
  // handleBackWard = () => {
  //   const state = this.state;
  //   const { isLongPress, backDisabled, title, currentUrl } = state;
  //   const currentItem = { urlTitle: title, url: currentUrl };
  //   const backNavArray = this.backNavArray;
  //   const forwardNavArray = this.forwardNavArray;
  //   if (!isLongPress && !backDisabled) {
  //     const removedArr = (function () {
  //       return backNavArray.reverse();
  //     })();
  //     const REMOVE_ITEM = removedArr.shift(); // out stack
  //     REMOVE_ITEM && forwardNavArray.push(currentItem);
  //     window.history.back();
  //     this.forwardNavArray = forwardNavArray;
  //     this.backNavArray = removedArr;
  //     state.pressNav = true;
  //     state.forwardDisabled = false;
  //     this.setItem('backNavArray', JSON.stringify(removedArr));
  //     this.setItem('forwardNavArray', JSON.stringify(forwardNavArray));
  //     if (!backNavArray.length) {
  //       state.backDisabled = true;
  //     }
  //   } else {
  //     state.isLongPress = false;
  //   }
  // }
  @action
  handleForward = () => {
    this._handleToward('forward');
  }
  @action
  handleBackWard = () => {
    this._handleToward('backward');
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
    if (time > 200) {
      const backNavArray = this.backNavArray; // get sequence list
      const forwardNavArray = this.forwardNavArray;
      state.nav = nav;
      state.time = 0;
      state.isLongPress = true;
      if (nav === 'backward') {
        state.showLeftPanel = true;
        this.handleMenuItem(backNavArray.reverse());
        this.setItem('backNavArray', JSON.stringify(backNavArray));
      }else {
        state.showRightPanel = true;
        this.handleMenuItem(forwardNavArray.reverse());
        this.setItem('forwardNavArray', JSON.stringify(forwardNavArray));
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
      return <Link key={idx} to={item!.url}>{item!.urlTitle || item!.url}</Link>;
    });
    this.menus = menus;
  }
  @action
  handleNavClose = (event: React.ChangeEvent|React.TouchEvent|React.MouseEvent<HTMLElement>, index: number|undefined) => {
    // click outside will invoke
    const state = this.state;
    const { nav, title, currentUrl } = state;
    // current title
    const currentItem = { urlTitle: title, url: currentUrl };
    let backNavArray = this.backNavArray.reverse();
    let forwardNavArray = this.forwardNavArray.reverse();
    if (nav === 'backward' && index !== undefined) {
      const toForward = backNavArray.splice(0, index + 1); // delete current and before
      const REMOVE_ITEM = toForward.splice(toForward.length - 1, 1); // delete click items
      forwardNavArray = toForward.reverse().concat(currentItem);
      this.handleMenuItem(forwardNavArray.reverse());
      this.backNavArray = backNavArray.reverse();
      this.forwardNavArray = forwardNavArray;
      this.state.title = REMOVE_ITEM[0]!.urlTitle; // set title
      this.setItem('backNavArray', JSON.stringify(backNavArray));
      this.setItem('forwardNavArray', JSON.stringify(forwardNavArray));
      state.showLeftPanel = false;
      if (!backNavArray.length) {
        state.backDisabled = true;
      }
      if (forwardNavArray.length) {
        state.forwardDisabled = false;
      }
    } else if (nav === 'forward' && index !== undefined) {
      const toBack = forwardNavArray.splice(0, index + 1);
      const REMOVE_ITEM = toBack.splice(toBack.length - 1, 1);
      backNavArray = toBack.reverse().concat(currentItem).concat(backNavArray);
      this.handleMenuItem(backNavArray.reverse());
      this.backNavArray = backNavArray;
      this.forwardNavArray = forwardNavArray.reverse();
      this.state.title = REMOVE_ITEM[0]!.urlTitle;
      this.setItem('backNavArray', JSON.stringify(backNavArray));
      this.setItem('forwardNavArray', JSON.stringify(forwardNavArray));
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
  // handle without click
  @action
  handleTitle = (title: string) => {
    this.state.title = title;
  }
  @action
  handleRouterChange = () => {
    this.state.pressNav = false;
  }
}
export default new NavPresenter();
