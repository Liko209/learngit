import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { observable, computed } from 'mobx';
import { Person } from 'sdk/models';
import Base from './Base';
import { isOnlyLetterOrNumbers } from '@/utils';

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
  };
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
  private _handleLetter(name: string | undefined) {
    return (name && name.slice(0, 1).toUpperCase()) || '';
  }
  private _handleOnlyLetterOrNumbers() {
    const firstLetter = this._handleLetter(this.firstName!);
    const lastLetter = this._handleLetter(this.lastName!);
    return firstLetter + lastLetter;
  }
  private _handleOneOfName() {
    const names =
      (!!this.firstName && this.firstName!.split(/\s+/)) ||
      (!!this.lastName && this.lastName!.split(/\s+/));
    const firstLetter = this._handleLetter(names[0]);
    const lastLetter = this._handleLetter(names[1]);
    return  firstLetter + lastLetter;
  }
  @computed
  public get shortName() {
    if (isOnlyLetterOrNumbers(this.firstName) && isOnlyLetterOrNumbers(this.lastName)) {
      return this._handleOnlyLetterOrNumbers();
    }
    if ((!this.firstName && this.lastName) || (this.firstName && !this.lastName)) {
      return this._handleOneOfName();
    }
    return '';
  }
}
