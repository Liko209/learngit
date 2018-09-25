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
const avatarUrl = 'image.file';
describe('AvatarViewModel', () => {
  it('firstName=alvin,lastName=huang,should return AH', () => {
    mockGetEntity(ENTITY_NAME.PERSON, () => personModelFactory.build({
      firstName: 'alvin',
      lastName: 'huang',
      headshot: {
        url: '',
      },
    }));
    initVM();
    VM.getPersonInfo();
    expect(VM.handleAvatar).toMatchObject({
      name: 'AH',
      bgColor: 'tomato',
    });
  });
  it('firstName=alvin,lastname=,no custom avatar,should return A', () => {
    mockGetEntity(ENTITY_NAME.PERSON, () => personModelFactory.build({
      firstName: 'alvin',
      lastName: '',
      headshot: {
        url: '',
      },
    }));
    initVM();
    VM.getPersonInfo();
    expect(VM.handleAvatar).toMatchObject({
      name: 'A',
      bgColor: 'tomato',
    });
  });
  it('user has custom avatar should return custom avatar url', () => {
    mockGetEntity(ENTITY_NAME.PERSON, () => personModelFactory.build({
      firstName: 'alvin',
      lastName: 'huang',
      headshot: {
        url: avatarUrl,
      },
    }));
    initVM();
    VM.getPersonInfo();
    expect(VM.handleAvatar.url).toBe(avatarUrl);
  });
  it('firstName has none alphabet, and no custom avatar should return default avatar', () => {
    mockGetEntity(ENTITY_NAME.PERSON, () => personModelFactory.build({
      firstName: '测试',
      lastName: 'mike',
      headshot: {
        url: '',
      },
    }));
    initVM();
    VM.getPersonInfo();
    expect(VM.handleAvatar.url).toBe(defaultAvatar);
    expect(VM.handleAvatar.name).toBe(undefined);
  });
  it('if username is empty, and no custom avatar should return default avatar', () => {
    mockGetEntity(ENTITY_NAME.PERSON, () => personModelFactory.build({
      firstName: '',
      lastName: '',
      headshot: {
        url: '',
      },
    }));
    initVM();
    VM.getPersonInfo();
    expect(VM.handleAvatar.url).toBe(defaultAvatar);
    expect(VM.handleAvatar.name).toBe(undefined);
  });
  it('if username is empty, and has custom avatar should return custom avatar', () => {
    mockGetEntity(ENTITY_NAME.PERSON, () => personModelFactory.build({
      firstName: '',
      lastName: '',
      headshot: {
        url: avatarUrl,
      },
    }));
    initVM();
    VM.getPersonInfo();
    expect(VM.handleAvatar).toMatchObject({
      url: avatarUrl,
    });
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
    VM.getPersonInfo();
    expect(VM.handleAvatar).toMatchObject({
      name: 'AH',
      bgColor: 'ash',
    });
    initVM(99999);
    VM.getPersonInfo();
    expect(VM.handleAvatar.bgColor).toBe('ash');
  });
  it('firstName=alvin 1huang,lastName=, should return A1', () => {
    mockGetEntity(ENTITY_NAME.PERSON, () => personModelFactory.build({
      firstName: 'alvin 1huang',
      lastName: '',
      headshot: {
        url: '',
      },
    }));
    initVM();
    VM.getPersonInfo();
    expect(VM.handleAvatar).toMatchObject({
      name: 'A1',
      bgColor: 'tomato',
    });
  });
  it('firstName=,lastName=2alvin huang, should return A1', () => {
    mockGetEntity(ENTITY_NAME.PERSON, () => personModelFactory.build({
      firstName: '',
      lastName: '2alvin huang',
      headshot: {
        url: '',
      },
    }));
    initVM(91);
    VM.getPersonInfo();
    expect(VM.handleAvatar).toMatchObject({
      name: '2H',
      bgColor: 'persimmon',
    });
  });
  it('firstName=,sd,lastName=alvin, should return A1', () => {
    mockGetEntity(ENTITY_NAME.PERSON, () => personModelFactory.build({
      firstName: ',sd',
      lastName: 'alvin',
      headshot: {
        url: '',
      },
    }));
    initVM();
    VM.getPersonInfo();
    expect(VM.handleAvatar).toMatchObject({
      name: ',A',
    });
  });
});
