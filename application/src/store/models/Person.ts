import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { observable, computed } from 'mobx';
import {
  Person,
  PhoneNumberModel,
  HeadShotModel,
  SanitizedExtensionModel,
  PhoneNumberInfo,
} from 'sdk/module/person/entity';
import Base from './Base';
import { phoneNumberDefaultFormat, getShortName } from '../helper';
import { PersonService } from 'sdk/module/person';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

export default class PersonModel extends Base<Person> {
  @observable
  companyId: number;
  @observable
  firstName: string;
  @observable
  lastName: string;
  @observable
  headshot?: HeadShotModel;
  @observable
  headshotVersion?: number;
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
  jobTitle?: string;
  @observable
  pseudoUserPhoneNumber?: string;
  rcAccountId?: number;
  inviterId?: number;
  @observable
  displayName?: string;
  @observable
  location?: string;
  @observable
  homepage?: string;
  @observable
  sanitizedRcExtension?: SanitizedExtensionModel;
  @observable
  deactivated: boolean;
  @observable
  flags?: number;
  @observable
  rcExtensionId: number;

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
      job_title,
      headshot_version,
      pseudo_user_phone_number,
      rc_account_id,
      inviter_id,
      display_name,
      location,
      homepage,
      sanitized_rc_extension,
      deactivated,
      flags,
    } = data;
    this.companyId = company_id;
    this.firstName = first_name;
    this.lastName = last_name;
    this.headshot = headshot;
    this.headshotVersion = headshot_version;
    this.email = email;
    this.rcPhoneNumbers = rc_phone_numbers || [];
    this.isPseudoUser = is_pseudo_user;
    this.glipUserId = glip_user_id;
    this.awayStatus = away_status;
    this.jobTitle = job_title;
    this.pseudoUserPhoneNumber = pseudo_user_phone_number;
    this.rcAccountId = rc_account_id;
    this.inviterId = inviter_id;
    this.displayName = display_name;
    this.location = location;
    this.homepage = homepage;
    this.sanitizedRcExtension = sanitized_rc_extension;
    this.deactivated = deactivated;
    this.flags = flags;
    this.rcExtensionId = data.rc_extension_id || 0;
  }

  static fromJS(data: Person) {
    return new PersonModel(data);
  }

  private _getEmailAsName(email: string) {
    if (email) {
      const name = email.split('@')[0];
      const firstUpperCase = (parseString: string) => {
        if (!parseString[0]) {
          return '';
        }
        return parseString[0].toUpperCase().concat(parseString.slice(1));
      };

      return name
        .split('.')
        .map((v: string) => firstUpperCase(v))
        .join(' ');
    }
    return '';
  }

  private _getCommonName() {
    if (this.isPseudoUser) {
      let pseudoUserDisplayName = '';
      if (this.glipUserId) {
        const linkedUser = getEntity<Person, PersonModel>(
          ENTITY_NAME.PERSON,
          this.glipUserId,
        );
        if (linkedUser) {
          pseudoUserDisplayName = linkedUser.displayName || '';
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
    return dName;
  }
  /**
   *
   */
  @computed
  get userDisplayName(): string {
    let dName = this._getCommonName();
    if (dName.length === 0) {
      dName = this._getEmailAsName(this.email);
    }

    return dName;
  }

  @computed
  get userDisplayNameForGroupName(): string {
    let dName = this._getCommonName();
    if (dName.length === 0) {
      dName = this.email;
    }

    return dName;
  }

  @computed
  get shortName() {
    return getShortName(this.firstName, this.lastName, this.email);
  }
  @computed
  get hasHeadShot() {
    return this.headshotVersion || this.headshot;
  }

  @computed
  get phoneNumbers(): PhoneNumberInfo[] {
    const personService = ServiceLoader.getInstance<PersonService>(
      ServiceConfig.PERSON_SERVICE,
    );
    return personService.getAvailablePhoneNumbers(
      this.companyId,
      this.rcPhoneNumbers,
      this.sanitizedRcExtension,
    );
  }

  isVisible() {
    const personService = ServiceLoader.getInstance<PersonService>(
      ServiceConfig.PERSON_SERVICE,
    );
    const person = personService.getSynchronously(this.id);
    return person && personService.isVisiblePerson(person);
  }
}
