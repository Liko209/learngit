/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-08-30 08:42:25
 * Copyright © RingCentral. All rights reserved.
 */
import faker from 'faker';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import 'reflect-metadata';
/* eslint-disable */
const reactI18next = jest.requireActual('react-i18next');

// Use fixed seed to make UT stable
faker.seed(1);

const withTranslation = () => Component => {
  Component.defaultProps = {
    ...Component.defaultProps,
    t: key => key,
  };
  return Component;
};
const useTranslation = () => ({
  t: i => i,
});

const Translation = ({ children }) => children(x => x);

const mockReactI18nNext = {
  // this mock makes sure any components using the withTranslation HoC receive the t function as a prop
  Translation,
  withTranslation,
  useTranslation,
  initReactI18next: reactI18next.initReactI18next,
  Trans: (props)=>JSON.stringify(props.values)
};

jest.mock('react-i18next', () => mockReactI18nNext);

const React = require('react');

React.memo = x => x;

configure({
  adapter: new Adapter(),
});
