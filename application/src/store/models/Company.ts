import { observable } from 'mobx';
import { Company } from 'sdk/models';
import Base from './Base';

export default class CompanyModel extends Base<Company> {
  @observable
  name: string;

  constructor(data: Company) {
    super(data);
    const { name }: { name: string } = data;
    this.name = name;
  }

  static fromJS(data: Company) {
    return new CompanyModel(data);
  }
}
