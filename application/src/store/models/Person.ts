import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { observable, computed } from 'mobx';
import { Person, PhoneNumberModel } from 'sdk/models';
import Base from './Base';
import {
  isOnlyLetterOrNumbers,
  handleOnlyLetterOrNumbers,
  handleOneOfName,
  phoneNumberDefaultFormat,
} from '../helper';
import PersonService from 'sdk/service/person';

const MainCompanyNumberType: string = 'MainCompanyNumber';

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
  rcPhoneNumbers?: PhoneNumberModel[];
  @observable
  isPseudoUser?: boolean;
  @observable
  glipUserId?: number;
  @observable
  awayStatus?: string;
  @observable
  pseudoUserPhoneNumber?: string;
  rcAccountId?: number;
  inviterId?: number;
  @observable
  displayName?: string;
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
      headshot_version,
      pseudo_user_phone_number,
      rc_account_id,
      inviter_id,
      display_name,
    } = data;
    this.companyId = company_id;
    this.firstName = first_name;
    this.lastName = last_name;
    this.headshot = headshot;
    this.headShotVersion = headshot_version;
    this.email = email;
    this.rcPhoneNumbers = rc_phone_numbers || [];
    this.isPseudoUser = is_pseudo_user;
    this.glipUserId = glip_user_id;
    this.awayStatus = away_status;
    this.pseudoUserPhoneNumber = pseudo_user_phone_number;
    this.rcAccountId = rc_account_id;
    this.inviterId = inviter_id;
    this.displayName = display_name;
  }

  static fromJS(data: Person) {
    return new PersonModel(data);
  }

  @computed
  get userDisplayName(): string {
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

    if (this.displayName) {
      return this.displayName;
    }

    const personService = PersonService.getInstance<PersonService>();
    return personService.generatePersonDisplayName(
      this.displayName,
      this.firstName,
      this.lastName,
      this.email,
    );
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

  @computed
  get phoneNumbers() {
    // filter out company main number
    if (this.rcPhoneNumbers && this.rcPhoneNumbers.length > 0) {
      return this.rcPhoneNumbers.filter(
        (phoneInfo: PhoneNumberModel) =>
          phoneInfo.usageType !== MainCompanyNumberType,
      );
    }
    return [];
  }
}
