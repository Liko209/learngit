/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-09-10 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { action, observable } from 'mobx';
import React from 'react';

// const SS = window.sessionStorage;
// const parse = JSON.parse;
// const stringify = JSON.stringify;
const TITLE_LENGTH = 52;
const FORWARD = 'forward';
const BACKWARD = 'backward';
const BACK_DISABLED = 'backDisabled';
const FORWARD_DISABLED = 'forwardDisabled';

class NavPresenter {
  // @action
  // getItem = (key: string) => {
  //   return SS.getItem(key) || '[]';
  // }
  // @action
  // setItem = (key: string, value: any) => {
  //   return SS.setItem(key, value);
  // }
  @observable buttonPressTimer: number = 0;
  @observable menus: string[] = [];
  @observable backNavArray: { title: string }[] = [];
  @observable forwardNavArray: { title: string }[] = [];
  @observable menuClicked: boolean = false;

  @observable state = {
    title: 'Jupiter',
    time: 0,
    forwardDisabled: true,
    backDisabled: true,
    nav: '',
    pressNav: false,
    disabled: true,
    showLeftPanel: false,
    showRightPanel: false,
    isLongPress: false,
    active: false,
  };
  private _handleTitleSlice(title: string) {
    return title.length > TITLE_LENGTH ? `${title.slice(0, TITLE_LENGTH + 2)}...` : title;
  }
  @action
  private _handleToward = (dir: string) => {
    const state = this.state;
    const { isLongPress, title } = state;
    const backNavArray = this.backNavArray;
    const forwardNavArray = this.forwardNavArray;
    // current title
    const currentItem = { title };
    // let disable;
    let removedArr;
    let addArr;
    let action;
    let disableType;
    let emptyDisable;
    if (!isLongPress) {
      if (dir === FORWARD) {
        // disable = forwardDisabled;
        removedArr = (function () {
          return forwardNavArray.reverse();
        })();
        addArr = backNavArray;
        action = () => {
          return window.history.go(1);
        };
        disableType = BACK_DISABLED;
        emptyDisable = FORWARD_DISABLED;
      } else {
        // disable = backDisabled;
        removedArr = (function () {
          return backNavArray.reverse();
        })();
        addArr = forwardNavArray;
        action = () => {
          return window.history.back();
        };
        disableType = FORWARD_DISABLED;
        emptyDisable = BACK_DISABLED;
      }
      const REMOVED_ITEM = removedArr.shift(); // out stack
      REMOVED_ITEM && addArr.push(currentItem);
      action();
      const itemTitle = REMOVED_ITEM!.title;
      this.state.title = this._handleTitleSlice(itemTitle); // set title
      this.forwardNavArray = dir === FORWARD ? removedArr.reverse() : addArr;
      this.backNavArray = dir === FORWARD ? addArr : removedArr.reverse(); // reversed
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
    this._handleToward(FORWARD);
  }
  @action
  handleBackWard = () => {
    this._handleToward(BACKWARD);
  }
  @action
  handleButtonPress = (nav: string) => {
    const timer = 300;
    this.buttonPressTimer = window.setTimeout(() => {
      const state = this.state;
      const backNavArray = this.backNavArray; // get sequence list
      const forwardNavArray = this.forwardNavArray;
      state.nav = nav;
      state.time = 0;
      state.isLongPress = true;
      if (nav === BACKWARD) {
        state.showLeftPanel = true;
        state.showRightPanel = false;
        this.handleMenuItem(backNavArray.reverse());
      }else {
        state.showRightPanel = true;
        state.showLeftPanel = false;
        this.handleMenuItem(forwardNavArray.reverse());
      }
    },                                        timer);
  }
  @action
  handleButtonRelease = (event: React.TouchEvent|React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    window.clearTimeout(this.buttonPressTimer);
  }
  @action
  handleMenuItem = (navArray: {title: string}[]) => {
    const menus = navArray && navArray.map((item) => {
      return this._handleTitleSlice(item.title);
    });
    this.menus = menus;
  }
  @action
  handleNavClose = (event: React.ChangeEvent|React.TouchEvent|React.MouseEvent<HTMLElement>, index: number|undefined) => {
    // click outside will invoke
    const state = this.state;
    const { nav, title } = state;
    // current title
    let backNavArray = this.backNavArray.reverse();
    let forwardNavArray = this.forwardNavArray.reverse();
    const handleCommon = (dir: string, currents: { title: string }[], contracts: { title: string }[]) => {
      const toContracts = currents.splice(0, index! + 1); // delete current and before
      const REMOVE_ITEM = toContracts.splice(toContracts.length - 1, 1); // delete click items
      if (dir === BACKWARD) {
        forwardNavArray = toContracts.reverse().concat({ title }).concat(contracts);
        const length = forwardNavArray.length;
        if (length > 10) {
          forwardNavArray.splice(0, length - 10);
        }
        this.handleMenuItem(forwardNavArray.reverse());
        this.backNavArray = backNavArray.reverse();
        this.forwardNavArray = forwardNavArray;
        window.history.go(-Math.abs(index! + 1));
        if (!backNavArray.length) {
          state.backDisabled = true;
        }
        if (forwardNavArray.length) {
          state.forwardDisabled = false;
        }
        state.showLeftPanel = false;
      } else {
        backNavArray = toContracts.reverse().concat({ title }).concat(contracts);
        const length = backNavArray.length;
        if (length > 10) {
          backNavArray.splice(0, length - 10);
        }
        this.handleMenuItem(backNavArray.reverse());
        this.backNavArray = backNavArray;
        this.forwardNavArray = forwardNavArray.reverse();
        window.history.go(index! + 1);
        if (!forwardNavArray.length) {
          state.forwardDisabled = true;
        }
        if (backNavArray.length) {
          state.backDisabled = false;
        }
        state.showRightPanel = false;
      }
      const itemTitle = REMOVE_ITEM && REMOVE_ITEM![0].title;
      this.state.title = this._handleTitleSlice(itemTitle); // set title
      this.menuClicked = true;
    };
    if (nav === BACKWARD && index !== undefined) {
      handleCommon(nav, backNavArray, forwardNavArray);
    } else if (nav === FORWARD && index !== undefined) {
      handleCommon(nav, forwardNavArray, backNavArray);
    }
    state.showRightPanel = false;
    state.showLeftPanel = false;
  }
  // handle without click
  @action
  handleTitle = (title: string) => {
    this.state.title = this._handleTitleSlice(title);
  }
  @action
  handleRouterChange = () => {
    this.state.pressNav = false;
    const forwardNavArray = this.forwardNavArray;
    if (forwardNavArray.length) {
      this.forwardNavArray = [];
      this.state.forwardDisabled = true;
    }
  }
}
export default new NavPresenter();
export { NavPresenter };
