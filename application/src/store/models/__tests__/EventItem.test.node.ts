/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-12-17 15:53:17
 * Copyright © RingCentral. All rights reserved.
 */
import EventItemModel from '../EventItem';

describe('EventItemModel', () => {
  it('new EventItemModel', () => {
    const eventItemModel = EventItemModel.fromJS({
      color: 'color',
      description: 'description',
      start: 1,
      end: 0,
      location: 'location',
      repeat: 'repeat',
      repeat_ending: 'repeat_ending',
      repeat_ending_after: 'repeat_ending_after',
      repeat_ending_on: 'repeat_ending_on',
      text: 'text',
    } as any);
    expect(eventItemModel.color).toBe('color');
    expect(eventItemModel.description).toBe('description');
    expect(eventItemModel.start).toBe(1);
    expect(eventItemModel.end).toBe(0);
    expect(eventItemModel.location).toBe('location');
    expect(eventItemModel.repeat).toBe('repeat');
    expect(eventItemModel.repeatEnding).toBe('repeat_ending');
    expect(eventItemModel.repeatEndingAfter).toBe('repeat_ending_after');
    expect(eventItemModel.repeatEndingOn).toBe('repeat_ending_on');
    expect(eventItemModel.text).toBe('text');
  });
});
