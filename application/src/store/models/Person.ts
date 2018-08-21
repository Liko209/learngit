import { observable, action, computed } from 'mobx';

export default class PersonModel {
  id: number;
  @observable companyId: number;
  @observable firstName?: string;
  @observable lastName?: string;
  @observable headshot: string;
  @observable email: string;
  @observable rcPhoneNumbers: string[];

  constructor(model: IPerson) {
    const {
      id,
      companyId,
      firstName,
      lastName,
      headshot,
      email,
      rcPhoneNumbers,
    } = model;
    this.id = id;
    this.companyId = companyId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.headshot = headshot;
    this.email = email;
    this.rcPhoneNumbers = rcPhoneNumbers;
  }

  static fromJS(data: any) {
    const {
      company_id: companyId,
      first_name: firstName,
      last_name: lastName,
      id,
      headshot,
      email,
      rc_phone_numbers: rcPhoneNumbers,
    } = data;
    const model = {
      id,
      companyId,
      firstName,
      lastName,
      headshot,
      email,
      rcPhoneNumbers,
    };

    return new PersonModel(model);
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
    rcPhoneNumbers?: string[];
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

  dispose() { } // eslint-disable-line
}
