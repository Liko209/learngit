/*
company = createCompany
  companyPool.get('rc')
  companyPool[0]
  default company
createPerson(company, partialPerson).
createProfile(person, partialProfile)
createGroup(company, partialGroup)

*/

import { ExtendedBaseModel } from 'sdk/module/models/ExtendedBaseModel';
import { Person } from 'sdk/module/person/entity';
import { Group } from 'sdk/module/group/entity';
import { Profile } from 'sdk/module/profile/entity';
import { Company } from 'sdk/module/company/entity';
import { Post } from 'sdk/module/post/entity';

interface IModelBuilder<T> {
  new (company: Company | number, partial?: Partial<T>): this;
}

class GroupModel {}

interface IGroupHelper {
  newGroup(partial?: Partial<Group>): Group;
}

// const helper: IGroupHelper;
// helper.newGroup();

// class GroupBuilder implements IGroupBuilder {
//   constructor() {

//   }
// }

// server models
