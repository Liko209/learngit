import { observable, action, computed } from 'mobx';
import { Person } from 'sdk/models';
import Base from './Base';

export default class PersonModel extends Base<Person> {
  id: number;
  @observable companyId: number;
  @observable firstName?: string;
  @observable lastName?: string;
  @observable headshot?: string;
  @observable email: string;
  @observable rcPhoneNumbers?: object[];
  @observable isPseudoUser?: boolean;

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
    } = data;
    this.companyId = company_id;
    this.firstName = first_name;
    this.lastName = last_name;
    this.headshot = headshot;
    this.email = email;
    this.rcPhoneNumbers = rc_phone_numbers;
    this.isPseudoUser = is_pseudo_user;
  }

  static fromJS(data: Person) {
    return new PersonModel(data);
  }

  @computed
  get displayName() {
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

  @action
  update({
    companyId,
    firstName,
    lastName,
    headshot,
    email,
    rcPhoneNumbers,
  }: {
    companyId?: number;
    firstName?: string;
    lastName?: string;
    headshot?: string;
    email?: string;
    rcPhoneNumbers?: object[];
  }) {
    if (companyId) {
      this.companyId = companyId;
    }
    if (firstName) {
      this.firstName = firstName;
    }
    if (lastName) {
      this.lastName = lastName;
    }
    if (headshot) {
      this.headshot = headshot;
    }
    if (email) {
      this.email = email;
    }
    if (rcPhoneNumbers) {
      this.rcPhoneNumbers = rcPhoneNumbers;
    }
  }
}
