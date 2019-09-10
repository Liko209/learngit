/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-08-15 16:51:09
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { shallow } from 'enzyme';
import { GlobalSearchView } from '../GlobalSearch.View';
import { JuiGlobalSearch } from 'jui/pattern/GlobalSearch';

jest.mock('jui/pattern/MessageInput/Mention', () => ({}));

describe('GlobalSearch.View', () => {
  it('should unmount result view as original when dialog closed to avoid background side effect. [bug/FIJI-8310]', () => {
    const wrapper = shallow(<GlobalSearchView open={false} />);
    const instance = wrapper.instance();

    expect(instance.currentView).toBe(null);
  });
  it('should contain onClose props when rendering JuiModal ', async () => {
    const props = {};
    const Wrapper = shallow(<GlobalSearchView {...props} />);
    const modal = Wrapper.find(JuiGlobalSearch);
    expect(modal.props().onClose).toBeTruthy();
  });
});
