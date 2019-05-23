import React from 'react';
import { shallow } from 'enzyme';
import { EventView } from '../Event.View';

describe('render()', () => {
  const props = {
    event: {
      location: 'location',
      text: 'text',
      description: 'description',
    },
    t: (e: any) => e,
    color: 'color',
    timeContent: {
      get: () => '1997/10/17',
    },
  } as any;
  it('render correctly', () => {
    const Wrapper = shallow(<EventView {...props} />);
    expect(Wrapper).toMatchSnapshot();
  });
});
