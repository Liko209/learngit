/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-04 16:45:39
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { mount } from 'enzyme';
import { ConversationPageHeader } from './../ConversationPageHeader';
import { ConversationPageHeaderPresenter, ConversationTypes } from '../ConversationPageHeaderPresenter';
import StoreManager from '@/store/base/StoreManager';

jest.mock('../ConversationPageHeaderPresenter', () => ({
  ConversationPageHeaderPresenter: jest.fn(),
  ConversationTypes: require.requireActual('../ConversationPageHeaderPresenter').ConversationTypes,
}));

jest.mock('react-i18next', () => ({
  translate: jest.fn((sec: any) => (Component: React.ComponentType<any>) => Component),
}));
const ConversationPageHeaderModule = require.requireActual('ui-components/molecules/ConversationPageHeader');
ConversationPageHeaderModule.JuiConversationPageHeader = ({ title, SubTitle, Right }: any) => (
  <div>
    {title}
    {SubTitle}
    {Right}
  </div>
);
jest.doMock('ui-components/molecules/ConversationPageHeader', ConversationPageHeaderModule);

const ButtonBarModule = require.requireActual('ui-components/atoms/ButtonBar');
ButtonBarModule.JuiButtonBar = ({ children }: any) => (
  <div className="button-bar">
    {children}
  </div>
);
jest.doMock('ui-components/atoms/ButtonBar', ButtonBarModule);

const CheckboxButtonModule = require.requireActual('ui-components/molecules/CheckboxButton');
CheckboxButtonModule.JuiCheckboxButton = ({ iconName, checkedIconName, checked }: any) => (
  <div className="checkbox-btn">
    {checked ? checkedIconName : iconName}
  </div>
);
jest.doMock('ui-components/molecules/CheckboxButton', CheckboxButtonModule);

const IconButtonModule = require.requireActual('ui-components/molecules/IconButton');
IconButtonModule.JuiIconButton = ({ children }: any) => (
  <div className="icon-btn">{children}</div>
);
jest.doMock('ui-components/molecules/IconButton', IconButtonModule);

jest.mock('../../../../utils/groupName', () => ({
  getGroupName: jest.fn().mockReturnValue('some group name'),
}));

const groupStore = {
  get: jest.fn().mockReturnValue({
    id: 1,
    isTeam: false,
    members: [1],
  }),
  addUsedIds: jest.fn(),
};

const mockPresenter = (type = ConversationTypes.TEAM, isFavorite = false) => {
  (ConversationPageHeaderPresenter as any).mockImplementation(() => ({
    getConversationType: jest.fn().mockReturnValue(type),
    getOtherMember: jest.fn().mockReturnValue({}),
    groupIsInFavorites: jest.fn().mockReturnValue(isFavorite),
  }));
};
describe('ConversationPageHeader', () => {
  beforeAll(() => {
    groupStore.get.mockReturnValue({
      id: 1,
      isTeam: false,
      members: [1],
    });
    StoreManager.prototype.getEntityMapStore = jest.fn().mockReturnValue(groupStore);

    mockPresenter();
  });

  it('should render title', () => {
    const html = mount(
      <ConversationPageHeader
        id={1}
      />,
    ).html();
    expect(html.includes('some group name')).toBe(true);
    expect(html.includes('settings')).toBe(true);
  });

  it('should render title (text) for SMS conversation', () => {
    mockPresenter(ConversationTypes.SMS);
    const html = mount(
      <ConversationPageHeader
        id={1}
      />,
    ).html();
    expect(html.includes('some group name (text)')).toBe(true);
  });

  it('should render correct icons for Team conversation', () => {
    mockPresenter(ConversationTypes.TEAM);
    const html = mount(
      <ConversationPageHeader
        id={1}
      />,
    ).html();
    expect(html.includes('star')).toBe(true);
    expect(html.includes('lock')).toBe(true);
    expect(html.includes('local_phone')).not.toBe(true);
    expect(html.includes('device_hub')).toBe(true);
    expect(html.includes('videocam')).toBe(true);
    expect(html.includes('person_add')).toBe(true);
  });

  it('should render correct icons for Me conversation', () => {
    mockPresenter(ConversationTypes.ME);
    const html = mount(
      <ConversationPageHeader
        id={1}
      />,
    ).html();
    expect(html.includes('star')).toBe(true);
    expect(html.includes('lock')).not.toBe(true);
    expect(html.includes('local_phone')).not.toBe(true);
    expect(html.includes('device_hub')).not.toBe(true);
    expect(html.includes('videocam')).not.toBe(true);
    expect(html.includes('person_add')).not.toBe(true);
  });

  it('should render correct icons for one to one conversation', () => {
    mockPresenter(ConversationTypes.NORMAL_ONE_TO_ONE);
    const html = mount(
      <ConversationPageHeader
        id={1}
      />,
    ).html();
    expect(html.includes('star')).toBe(true);
    expect(html.includes('lock')).not.toBe(true);
    expect(html.includes('local_phone')).toBe(true);
    expect(html.includes('device_hub')).not.toBe(true);
    expect(html.includes('videocam')).toBe(true);
    expect(html.includes('person_add')).toBe(true);
  });

  it('should render correct icons for sms conversation', () => {
    mockPresenter(ConversationTypes.SMS);
    const html = mount(
      <ConversationPageHeader
        id={1}
      />,
    ).html();
    expect(html.includes('star')).toBe(true);
    expect(html.includes('lock')).not.toBe(true);
    expect(html.includes('local_phone')).toBe(true);
    expect(html.includes('device_hub')).not.toBe(true);
    expect(html.includes('videocam')).toBe(true);
    expect(html.includes('person_add')).toBe(true);
  });

  it('should render correct icons for group conversation', () => {
    mockPresenter(ConversationTypes.NORMAL_GROUP);
    const html = mount(
      <ConversationPageHeader
        id={1}
      />,
    ).html();
    expect(html.includes('star')).toBe(true);
    expect(html.includes('lock')).not.toBe(true);
    expect(html.includes('local_phone')).not.toBe(true);
    expect(html.includes('device_hub')).toBe(true);
    expect(html.includes('videocam')).toBe(true);
    expect(html.includes('person_add')).toBe(true);
  });

  it('should render checked lock icon for private team', () => {
    groupStore.get.mockReturnValue({
      id: 1,
      isTeam: true,
      privacy: 'private',
      members: [1],
    });
    mockPresenter(ConversationTypes.TEAM);

    const html = mount(
      <ConversationPageHeader
        id={1}
      />,
    ).html();
    expect(html.includes('lock')).toBe(true);
    expect(html.includes('lock_open')).not.toBe(true);
  });

  it('should render unchecked lock icon for public team', () => {
    groupStore.get.mockReturnValue({
      id: 1,
      isTeam: true,
      privacy: 'public',
      members: [1],
    });
    mockPresenter(ConversationTypes.TEAM);

    const html = mount(
      <ConversationPageHeader
        id={1}
      />,
    ).html();
    expect(html.includes('lock_open')).toBe(true);
  });

  it('should render unchecked star icon for not favorite conversation', () => {
    mockPresenter(ConversationTypes.NORMAL_GROUP);

    const html = mount(
      <ConversationPageHeader
        id={1}
      />,
    ).html();
    expect(html.includes('star_border')).toBe(true);
  });

  it('should render checked star icon for not favorite conversation', () => {
    mockPresenter(ConversationTypes.NORMAL_GROUP, true);

    const html = mount(
      <ConversationPageHeader
        id={1}
      />,
    ).html();
    expect(html.includes('star_border')).not.toBe(true);
    expect(html.includes('star')).toBe(true);
  });
});
