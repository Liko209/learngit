import React from 'react';
import { shallow } from 'enzyme';
import { ContactSearchListView } from '../ContactSearchList.View';

describe('ContactSearchListView', () => {
  describe('Will show the empty view if no matched results [JPT-2189]', () => {
    it('An empty view is shown', () => {
      const props = {
        displayedSearchResult: [],
        isSearching: false,
        loadMore: jest.fn(),
        loadInitialData: jest.fn(),
        hasMore: jest.fn(),
        focusIndex: 0,
        onEnter: jest.fn(),
        increaseFocusIndex: jest.fn(),
        decreaseFocusIndex: jest.fn(),
        t: jest.fn().mockReturnValue(''),
      };
      const wrapper = shallow(<ContactSearchListView {...props} />);
      console.log(wrapper.debug());
      expect(wrapper.children().length).toEqual(0);
    });
  });
});
