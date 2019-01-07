import { observable } from 'mobx';
import { Company } from 'sdk/module/company/entity';
import Base from './Base';

export default class CompanyModel extends Base<Company> {
  @observable
  name: string;
  @observable
  customEmoji: { [index: string]: { data: string } };
  rcAccountId?: number;

  constructor(data: Company) {
    super(data);
    this.name = data.name;
    this.customEmoji = data.custom_emoji;
    this.rcAccountId = data.rc_account_id;
  }

  static fromJS(data: Company) {
    return new CompanyModel(data);
  }
}
