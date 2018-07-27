import React from 'react';
import { shallow } from 'enzyme';
import * as H from 'history';
import { service } from 'sdk';

import Login from '../index';
import Button from '../Button';

const { AuthService } = service;

const history = H.createBrowserHistory();
const location = H.createLocation('/');
const match = {
  params: 1,
  isExact: true,
  path: 'login',
  url: 'login',
};
const staticContext: any;
let wrapper: any;

describe('<Login />', () => {
  beforeAll(() => {
    wrapper = shallow(
      <Login
        history={history}
        location={location}
        match={match}
        staticContext={staticContext}
      />,
    );
  });
  describe('render()', () => {
    it('<Login /> should be rendering', () => {
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('handleChange()', () => {
    it('username input value should be Devin', () => {
      wrapper
        .find('[name="username"]')
        .simulate('change', { target: { name: 'username', value: 'Devin' } });
      wrapper
        .find('[name="password"]')
        .simulate('change', { target: { name: 'password', value: 'abc123' } });
      expect(wrapper.state('username')).toBe('Devin');
      expect(wrapper.find('[name="username"]').props().value).toBe('Devin');
    });
  });

  describe('handleClick()', () => {
    it('AuthService login() should be called with specific params', () => {
      const authService = {
        login: jest.fn(),
      };
      wrapper
        .find('[name="username"]')
        .simulate('change', { target: { name: 'username', value: 'Devin' } });
      wrapper
        .find('[name="password"]')
        .simulate('change', { target: { name: 'password', value: 'abc123' } });
      AuthService.getInstance = jest.fn().mockReturnValue(authService);
      authService.login = jest.fn().mockResolvedValue(null);
      wrapper.find(Button).simulate('click', { preventDefault: jest.fn });
      expect(authService.login).toHaveBeenCalledWith({
        extension: '',
        password: 'abc123',
        username: 'Devin',
      });
    });
  });
});
