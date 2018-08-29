import { observable } from 'mobx';
import { Company } from 'sdk/models';
import { IEntity } from '../store';

export default class CompanyModel implements IEntity {
  id: number;
  @observable name: string;

  constructor(data: Company) {
    const { id, name }: { id: number; name: string } = data;

    this.id = id;
    this.name = name;
  }

  static fromJS(data: Company) {
    return new CompanyModel(data);
  }

  dispose() { }
}
