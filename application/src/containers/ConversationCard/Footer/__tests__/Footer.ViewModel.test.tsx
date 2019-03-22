/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-03-21 16:30:00
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { getEntity, getGlobalValue } from '../../../../store/utils';
import { ENTITY_NAME } from '@/store';
import { Footer } from '../Footer';
import { FooterViewModel } from '../Footer.ViewModel';
import { shallow } from 'enzyme';

jest.mock('../../../../store/utils');

const t = (key: string) => {
  const map = {
    'common.You': 'You',
    'common.and': 'and',
    'message.likeThis': 'like this',
  };

  return map[key];
};

const usersMock = [
  {
    id: 0,
    userDisplayName: 'Aaron Huo',
  },
  {
    id: 1,
    userDisplayName: 'Allen Lian',
  },
  {
    id: 2,
    userDisplayName: 'Mia Cai',
  },
  {
    id: 3,
    userDisplayName: 'William Ye',
  },
];

const getLikes = (...ids: number[]) =>
  ids.reduce(
    (acc, id) =>
      usersMock.find(({ id: userId }) => id === userId) ? [...acc, id] : acc,
    [],
  );

const postsMock = [
  {
    id: 0,
    likes: getLikes(0),
  },
  {
    id: 1,
    likes: getLikes(1),
  },
  {
    id: 2,
    likes: getLikes(1, 0),
  },
  {
    id: 3,
    likes: getLikes(2, 1, 0),
  },
  {
    id: 4,
    likes: getLikes(2, 3, 1),
  },
];

const ASSERTIONS = [
  'You like this',
  'Allen Lian like this',
  'You, and Allen Lian like this',
  'You, Mia Cai, and Allen Lian like this',
  'Mia Cai, William Ye, and Allen Lian like this',
];

describe('FooterViewModel liked users message [JPT-1371]', () => {
  beforeEach(() => {
    (getEntity as jest.Mock).mockImplementation((entityName, id) => {
      const handlerMap = {
        [ENTITY_NAME.POST]: (id: number) =>
          postsMock.find(({ id: postId }) => postId === id) || {},
        [ENTITY_NAME.PERSON]: (id: number) =>
          usersMock.find(({ id: userId }) => userId === id) || {},
      };

      const handler = handlerMap[entityName];

      return handler ? handler(id) : {};
    });

    (getGlobalValue as jest.Mock).mockImplementation(value => 0);
  });

  it(`should be "${ASSERTIONS[0]}" when only you`, () => {
    const footerProps = shallow(<Footer postId={0} />).props();
    const props = { ...footerProps, t };
    const { likedUsersNameMessage } = new FooterViewModel(props);

    expect(likedUsersNameMessage).toBe(ASSERTIONS[0]);
  });

  it(`should be "${ASSERTIONS[1]}" when only Allen`, () => {
    const footerProps = shallow(<Footer postId={1} />).props();
    const props = { ...footerProps, t };
    const { likedUsersNameMessage } = new FooterViewModel(props);

    expect(likedUsersNameMessage).toBe(ASSERTIONS[1]);
  });

  it(`should be "${
    ASSERTIONS[2]
  }" when members are Allen and you in order`, () => {
    const footerProps = shallow(<Footer postId={2} />).props();
    const props = { ...footerProps, t };
    const { likedUsersNameMessage } = new FooterViewModel(props);

    expect(likedUsersNameMessage).toBe(ASSERTIONS[2]);
  });

  it(`should be "${
    ASSERTIONS[3]
  }" when members are Mia, Allen and you in order`, () => {
    const footerProps = shallow(<Footer postId={3} />).props();
    const props = { ...footerProps, t };
    const { likedUsersNameMessage } = new FooterViewModel(props);

    expect(likedUsersNameMessage).toBe(ASSERTIONS[3]);
  });

  it(`should be "${
    ASSERTIONS[4]
  }" when members are Mia, William and Allen in order`, () => {
    const footerProps = shallow(<Footer postId={4} />).props();
    const props = { ...footerProps, t };
    const { likedUsersNameMessage } = new FooterViewModel(props);

    expect(likedUsersNameMessage).toBe(ASSERTIONS[4]);
  });
});
