import ViewModel from '../ViewModel';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import defaultAvatar from '../defaultAvatar.svg';

import {
  personModelFactory,
} from '../../../__tests__/factories';
jest.mock('@/store/utils', () => {
  return {
    getEntity: jest.fn(),
  };
});

const mockGetEntity = (entityName: string, impl: Function) => {
  (getEntity as jest.Mock).mockImplementation((en: string, id: number) => {
    if (en === entityName) {
      return impl(id);
    }
  });
};

let VM: ViewModel;
function initVM(uid: number = 123) {
  VM = new ViewModel(uid);
}
type UserInfo = {
  firstName?: string;
  lastName?: string;
  url?: string;
};
type MatchObj = {
  name?: string;
  bgColor?: string;
  url?: string;
};
function getUserInfo(firstName = '', lastName = '', url = '') {
  return {
    firstName,
    lastName,
    url,
  };
}
function getMatchObj(name = '', bgColor = '', url = '') {
  return {
    name,
    bgColor,
    url,
  };
}
function handleCommonMock(userInfo: UserInfo, matchObj: MatchObj, uid = 123) {
  mockGetEntity(ENTITY_NAME.PERSON, () => personModelFactory.build({
    firstName: userInfo!.firstName || '',
    lastName: userInfo!.lastName || '',
    headshot: {
      url: userInfo!.url || '',
    },
  }));
  initVM(uid);
  const { url = '', name = '', bgColor = '' } = matchObj || {};
  const obj = {};
  url ?  obj['url'] = url : null;
  name ? obj['name'] = name : null;
  bgColor ? obj['bgColor'] = bgColor : null;
  expect(VM.avatarInfo).toMatchObject(obj);
}
const avatarUrl = 'image.file';
describe('AvatarViewModel', () => {
  it('firstName=alvin,lastName=huang,should return name=AH', () => {
    handleCommonMock(getUserInfo('alvin', 'huang'),
                     getMatchObj('AH', 'tomato'));
  });
  it('firstName=alvin,lastname=,no custom avatar,should return name=A,bgColor=tomato', () => {
    handleCommonMock(getUserInfo('alvin', ''),
                     getMatchObj('A', 'tomato'));
  });
  it('user has custom avatar should return custom avatar url', () => {
    handleCommonMock(getUserInfo('alvin', 'huang', avatarUrl),
                     getMatchObj('', '', avatarUrl));
  });
  it('firstName has none alphabet, and no custom avatar should return default avatar', () => {
    handleCommonMock(getUserInfo('测试', 'mike'),
                     getMatchObj('', '', defaultAvatar));
  });
  it('if username is empty, and no custom avatar should return default avatar', () => {
    handleCommonMock(getUserInfo('', ''),
                     getMatchObj('', '', defaultAvatar));
  });
  it('if username is empty, and has custom avatar should return custom avatar', () => {
    handleCommonMock(getUserInfo('', '', avatarUrl),
                     getMatchObj('', '', avatarUrl));
  });
  it('if user id is specified, then color is specified', () => {
    mockGetEntity(ENTITY_NAME.PERSON, () => personModelFactory.build({
      firstName: 'alvin huang',
      lastName: '',
      headshot: {
        url: '',
      },
    }));
    initVM(99999);
    expect(VM.avatarInfo).toMatchObject({
      name: 'AH',
      bgColor: 'ash',
    });
    initVM(99999);
    expect(VM.avatarInfo).toMatchObject({
      name: 'AH',
      bgColor: 'ash',
    });
  });
  it('firstName=alvin 1huang,lastName=, should return name=A1,bgColor=tomato', () => {
    handleCommonMock(getUserInfo('alvin 1huang', ''),
                     getMatchObj('A1', 'tomato'));
  });
  it('firstName=,lastName=2alvin huang, should return name=2H,bgColor=persimmon', () => {
    handleCommonMock(getUserInfo('', '2alvin huang'),
                     getMatchObj('2H', 'persimmon'), 91);
  });
  it('firstName=,sd,lastName=alvin, should return name=,A,bgColor=tomato', () => {
    handleCommonMock(getUserInfo(',sd', 'alvin'),
                     getMatchObj(',A', 'tomato'));
  });
});
