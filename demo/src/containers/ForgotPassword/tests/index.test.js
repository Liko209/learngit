import React from 'react';
import { shallow } from 'enzyme';

import ForgotPassword from '../index';

describe('<NotFound />', () => {
  it('should render the Page forgot password text', () => {
    const renderedComponent = shallow(<ForgotPassword />);
    expect(
      renderedComponent.contains(
        <div className="fortgot-password">
          <p>forgot password</p>
        </div>
      )
    ).toEqual(true);
  });
});
