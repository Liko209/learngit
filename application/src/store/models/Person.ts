import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { observable, computed } from 'mobx';
import { Person } from 'sdk/models';
import Base from './Base';
import {
  isOnlyLetterOrNumbers,
  handleOnlyLetterOrNumbers,
  handleOneOfName,
  phoneNumberDefaultFormat,
} from '../helper';

export default class PersonModel extends Base<Person> {
  @observable
  companyId: number;
  @observable
  firstName: string;
  @observable
  lastName: string;
  @observable
  headshot?: {
    url: string;
  };
  @observable
  headShotVersion?: string | undefined;
  @observable
  email: string;
  @observable
  rcPhoneNumbers?: object[];
  @observable
  isPseudoUser?: boolean;
  @observable
  glipUserId?: number;
  @observable
  awayStatus?: string;
  @observable
  title?: string;
  @observable
  pseudoUserPhoneNumber?: string;
  rcAccountId?: number;
  inviterId?: number;
  constructor(data: Person) {
    super(data);
    const {
      company_id,
      first_name = '',
      last_name = '',
      headshot,
      email,
      rc_phone_numbers,
      is_pseudo_user,
      glip_user_id,
      away_status,
      title,
      headshot_version,
      pseudo_user_phone_number,
      rc_account_id,
      inviter_id,
    } = data;
    this.companyId = company_id;
    this.firstName = first_name;
    this.lastName = last_name;
    this.headshot = headshot;
    this.headShotVersion = headshot_version;
    this.email = email;
    this.rcPhoneNumbers = rc_phone_numbers;
    this.isPseudoUser = is_pseudo_user;
    this.glipUserId = glip_user_id;
    this.awayStatus = away_status;
    this.title = title;
    this.pseudoUserPhoneNumber = pseudo_user_phone_number;
    this.rcAccountId = rc_account_id;
    this.inviterId = inviter_id;
  }

  static fromJS(data: Person) {
    return new PersonModel(data);
  }

  @computed
  get displayName(): string {
    if (this.isPseudoUser) {
      let pseudoUserDisplayName = '';
      if (this.glipUserId) {
        const linkedUser = getEntity(ENTITY_NAME.PERSON, this.glipUserId);
        if (linkedUser) {
          pseudoUserDisplayName = linkedUser.displayName;
        }
      }
      if (!pseudoUserDisplayName) {
        pseudoUserDisplayName = this.pseudoUserPhoneNumber
          ? phoneNumberDefaultFormat(this.pseudoUserPhoneNumber)
          : this.firstName;
      }
      return pseudoUserDisplayName;
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

  @computed
  get shortName() {
    if (
      this.firstName &&
      isOnlyLetterOrNumbers(this.firstName) &&
      this.lastName &&
      isOnlyLetterOrNumbers(this.lastName)
    ) {
      return handleOnlyLetterOrNumbers(this.firstName, this.lastName);
    }
    if (
      (!this.firstName && this.lastName) ||
      (this.firstName && !this.lastName)
    ) {
      return handleOneOfName(this.firstName, this.lastName);
    }
    return '';
  }
  @computed
  get hasHeadShot() {
    return this.headShotVersion || this.headshot;
  }
}
