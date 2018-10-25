import { observable } from 'mobx';
import { Company } from 'sdk/models';
import Base from './Base';

export default class CompanyModel extends Base<Company> {
  @observable
  name: string;
  @observable
  customEmoji: { [index: string]: { data: string } };

  constructor(data: Company) {
    super(data);
    this.name = data.name;
    this.customEmoji = data.custom_emoji;
  }

  static fromJS(data: Company) {
    return new CompanyModel(data);
  }
}
