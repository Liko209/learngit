import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { observable, computed } from 'mobx';
import { Person } from 'sdk/models';
import Base from './Base';

export default class PersonModel extends Base<Person> {
  id: number;
  @observable
  companyId: number;
  @observable
  firstName?: string;
  @observable
  lastName?: string;
  @observable
  headshot?: {
    url: string,
  } | string;
  @observable
  email: string;
  @observable
  rcPhoneNumbers?: object[];
  @observable
  isPseudoUser?: boolean;
  @observable
  glipUserId?: number;

  constructor(data: Person) {
    super(data);
    const {
      company_id,
      first_name,
      last_name,
      headshot,
      email,
      rc_phone_numbers,
      is_pseudo_user,
      glip_user_id,
    } = data;
    this.companyId = company_id;
    this.firstName = first_name;
    this.lastName = last_name;
    this.headshot = headshot;
    this.email = email;
    this.rcPhoneNumbers = rc_phone_numbers;
    this.isPseudoUser = is_pseudo_user;
    this.glipUserId = glip_user_id;
  }

  static fromJS(data: Person) {
    return new PersonModel(data);
  }

  @computed
  get displayName(): string {
    if (this.isPseudoUser) {
      if (this.glipUserId) {
        const linkedUser = getEntity(ENTITY_NAME.PERSON, this.glipUserId);
        if (linkedUser) {
          return linkedUser.displayName;
        }
      }
    }
    let dName = '';
    if (this.firstName) {
      dName += this.firstName;
    }

    if (this.lastName) {
      if (dName.length > 0) {
        dName += ' ';
      }
      dName += this.lastName;
    }

    if (dName.length === 0) {
      dName = this.email;
    }

    return dName;
  }
}
