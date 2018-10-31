import { observable } from 'mobx';
import { Company } from 'sdk/models';
import Base from './Base';

export default class CompanyModel extends Base<Company> {
  @observable
  name: string;
  rcAccountId?: number;
  constructor(data: Company) {
    super(data);
    const {
      name,
      rc_account_id,
    }: { name: string; rc_account_id?: number } = data;
    this.name = name;
    this.rcAccountId = rc_account_id;
  }

  static fromJS(data: Company) {
    return new CompanyModel(data);
  }
}
