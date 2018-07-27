import { observable } from 'mobx';

export default class CompanyModel {
  id: number;
  @observable name: string;

  constructor(model: ICompany) {
    const { id, name }: { id: number; name: string } = model;

    this.id = id;
    this.name = name;
  }

  static fromJS(data: ICompany) {
    return new CompanyModel(data);
  }

  dispose() {} // eslint-disable-line
}
