import { observable, action, computed } from 'mobx';

export default class PersonModel {
  id: number;
  @observable companyId: number;
  @observable _firstName: string;
  @observable _lastName: string;
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
    this._firstName = firstName;
    this._lastName = lastName;
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
  get firstName() {
    if (this._firstName) {
      return this._firstName;
    }
    return '';
  }

  @computed
  get lastName() {
    if (this._lastName) {
      return this._lastName;
    }
    return '';
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
      this._firstName = firstName;
    }
    if (lastName) {
      this._lastName = lastName;
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
