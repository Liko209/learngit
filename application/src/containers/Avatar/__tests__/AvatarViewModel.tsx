import ViewModel from '../ViewModel';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
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
function initVM() {

  VM = new ViewModel(123);
}

describe('AvatarViewModel', () => {
  it('should return AH', () => {
    mockGetEntity(ENTITY_NAME.PERSON, () => personModelFactory.build({
      firstName: 'alvin',
      lastName: 'huang',
      headshot: {
        url: '',
      },
    }));
    initVM();
    expect(VM.handleAvatar()).toBe('AH');
  });
});
