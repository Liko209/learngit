import React from 'react';
import { shallow } from 'enzyme';

import { GroupSearchView } from '../GroupSearch.View';
import toJson from 'enzyme-to-json';

describe('GroupSearch.View', () => {
  it('should render correctly [JPT-2789]', () => {
    const wrapper = shallow(
      <GroupSearchView
        size={1}
        list={[1]}
        onSelectChange={() => {}}
        searchGroups={() => {}}
      />,
    );
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
