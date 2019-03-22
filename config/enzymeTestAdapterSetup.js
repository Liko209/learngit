/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-08-30 08:42:25
 * Copyright © RingCentral. All rights reserved.
 */
import faker from 'faker';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import 'reflect-metadata';
// Use fixed seed to make UT stable
faker.seed(1);

const withNamespaces = () => Component => {
  Component.defaultProps = { ...Component.defaultProps, t: () => '' };
  return Component;
};

const mockReactI18nNext = {
  // this mock makes sure any components using the translate HoC receive the t function as a prop
  translate: withNamespaces,
  withNamespaces: withNamespaces
};

jest.mock('react-i18next', () => mockReactI18nNext);

const React = require('react');
React.memo = x => x;

configure({ adapter: new Adapter() });
