import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

const Link = styled(NavLink)`
  &&{
    color: ${({ theme }) => theme.palette.grey[700]};
    text-decoration: none;
    font-size: ${({ theme }) => theme.typography.fontSize + 'px'};
  }
`;

const SS = window.sessionStorage;
const setItem = (key: string, value: any) => {
  return SS.setItem(key, value);
};
const getItem = (key: string) => {
  return SS.getItem(key);
};
type TNav = {
  title: string;
  disabled: boolean;
  isLongPress: boolean;
  backNavArray: { url: string, urlTitle: string }[];
  time: number;
  nav: string;
  forwardDisabled: boolean;
  backDisabled: boolean;
  menus: {}[];
  prevUrl: string;
  currentUrl: string;
  pressNav: boolean;
  showLeftPanel: boolean;
  showRightPanel: boolean;
  forwardNavArray: { url: string, urlTitle: string }[];
};
const NAV_STATE = {
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
  menus: [],
  showLeftPanel: false,
  showRightPanel: false,
  isLongPress: false,
  forwardNavArray: [],
};
const setItems = (obj: TNav) => {
  Object.keys(obj).forEach((item) => {
    return setItem(item, typeof obj[item] !== 'string' ? JSON.stringify(obj[item]) : obj[item]);
  });
};
setItems(NAV_STATE);

const parse = JSON.parse;
let buttonPressTimer: any = 0;
const HandleNav = {
  getItems: (obj: TNav) => {
    const keys = Object.keys(obj);
    keys.forEach((item) => {
      if (item === 'title' || item === 'nav' || item === 'prevUrl' || item === 'currentUrl') {
        obj[item] = getItem(item) || '';
      } else {
        obj[item] = parse(getItem(item) || '[]');
      }
    });
    return obj;
  },
  handleForward : () => {
    const { forwardNavArray, backNavArray, isLongPress, forwardDisabled } = HandleNav.getItems(NAV_STATE);
    if (!isLongPress && !forwardDisabled) {
      window.history.forward();
      const REMOVEITEM = forwardNavArray.shift();
      REMOVEITEM && backNavArray.push(REMOVEITEM);
      setItem('backNavArray', JSON.stringify(backNavArray));
      setItem('forwardNavArray', JSON.stringify(forwardNavArray));
      setItem('pressNav', 'true');
      setItem('backDisabled', 'false');
      if (!forwardNavArray.length) {
        setItem('forwardDisabled', 'true');
      }
    } else {
      setItem('isLongPress', 'false');
    }
  },
  handleBackWard : () => {
    const { isLongPress, backNavArray, backDisabled, forwardNavArray, title, currentUrl } = HandleNav.getItems(NAV_STATE);
    // let { forwardNavArray } = this.state;
    const currentItem = { urlTitle: title, url: currentUrl };
    if (!isLongPress && !backDisabled) {
      window.history.back();
      backNavArray.splice(backNavArray.length - 1, backNavArray.length, currentItem);
      forwardNavArray.push(currentItem);
      setItem('forwardNavArray', JSON.stringify(forwardNavArray));
      setItem('backNavArray', JSON.stringify(backNavArray));
      setItem('pressNav', 'true');
      setItem('forwardDisabled', 'false');
      if (!backNavArray.length) {
        setItem('backDisabled', 'true');
      }
    } else {
      setItem('isLongPress', 'false');
    }
  },
  handleButtonPress : () => {
    const timer = 300;
    buttonPressTimer = setTimeout(() =>
      setItem('time', timer),     timer);
  },
  handleButtonRelease : (evt: React.TouchEvent|React.MouseEvent, nav: string) => {
    // click will trigger also
    clearTimeout(buttonPressTimer);
    const { time, backNavArray, forwardNavArray } = HandleNav.getItems(NAV_STATE);
    if (time > 200) {
      setItem('nav', nav);
      setItem('time', 0);
      setItem('isLongPress', 'true');
      if (nav === 'backward') {
        setItem('showLeftPanel', 'true');
        HandleNav.handleMenuItem(backNavArray.reverse());
      }else {
        setItem('showRightPanel', 'true');
        HandleNav.handleMenuItem(forwardNavArray.reverse());
      }
    } else {
      setItem('showRightPanel', 'false');
      setItem('showLeftPanel', 'false');
      setItem('isLongPress', 'false');
    }
  },
  handleMenuItem : (navArray: {url: string, urlTitle: string}[]) => {
    const menus = navArray && navArray.map((item, idx) => {
      return <Link key={idx} to={item!.url}>{item!.urlTitle}</Link>;
    });
    setItem('menus', menus);
  },
  handleNavClose : (event: React.ChangeEvent|React.TouchEvent|React.MouseEvent<HTMLElement>, index: number|undefined) => {
    const { nav, title, currentUrl } = HandleNav.getItems(NAV_STATE);
    // current title
    const currentItem = { urlTitle: title, url: currentUrl };
    let { backNavArray, forwardNavArray } = HandleNav.getItems(NAV_STATE);
    // const { forwardNavArray } = this.state;
    if (nav === 'backward' && index !== undefined) {
      const toForward = backNavArray.splice(0, index + 1); // delete current and before
      toForward.splice(toForward.length - 1, 1); // delete click items
      forwardNavArray = forwardNavArray.concat(toForward).concat(currentItem);
      HandleNav.handleMenuItem(forwardNavArray.reverse());
      setItem('backNavArray', JSON.stringify(backNavArray));
      setItem('forwardNavArray', JSON.stringify(forwardNavArray));
      setItem('showLeftPanel', 'false');
      if (!backNavArray.length) {
        setItem('backDisabled', 'true');
      }
      if (forwardNavArray.length) {
        setItem('forwardDisabled', 'false');
      }
    } else if (nav === 'forward' && index !== undefined) {
      const toBack = forwardNavArray.splice(0, index + 1);
      toBack.splice(toBack.length - 1, 1);
      backNavArray = backNavArray.concat(toBack).concat(currentItem);
      HandleNav.handleMenuItem(backNavArray.reverse());
      setItem('backNavArray', JSON.stringify(backNavArray));
      setItem('forwardNavArray', JSON.stringify(forwardNavArray));
      setItem('showRightPanel', 'false');
      if (!forwardNavArray.length) {
        setItem('forwardDisabled', 'true');
      }
      if (backNavArray.length) {
        setItem('backDisabled', 'false');
      }
    }
    setItem('showRightPanel', 'false');
    setItem('showLeftPanel', 'false');
  },
  handleTitle: (title: string) => {
    console.log(title);
    setItem('title', title);
  },
  handleRouterChange : () => {
    setItem('pressNav', 'false');
  },
};
export default HandleNav;
