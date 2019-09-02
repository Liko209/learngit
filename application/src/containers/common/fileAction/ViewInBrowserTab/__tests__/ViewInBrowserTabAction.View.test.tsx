import React from 'react';
import { ViewInBrowserTabAction } from '../ViewInBrowserTabAction.View';
import { shallow } from 'enzyme';
import { Translation } from 'react-i18next';

jest.mock('@/common/isUserAgent', () => ({ isElectron: false }));
describe('ViewInBrowserTabAction', () => {
  const wrapper = shallow(<ViewInBrowserTabAction item={{ name: '' }} />);
  it('should render correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });
  it('should open a window', done => {
    global.window.open = jest.fn();
    wrapper.simulate('click');

    setTimeout(() => {
      expect(global.window.open).toHaveBeenCalled();
      done();
    });
  });

  it('should show correct text in browser [JPT-2926]', () => {
    expect(wrapper.find(Translation).shallow()).toMatchSnapshot();
  });
});
