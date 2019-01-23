/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-21 16:46:03
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { Item } from 'sdk/module/item/entity';
import FileItemModel from '@/store/models/FileItem';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import PersonModel from '@/store/models/Person';
import { Person } from 'sdk/module/person/entity';
import { dateFormatter } from '@/utils/date';
import { FileProps, FileViewProps } from './File.types';

class FileViewModel extends AbstractViewModel<FileProps>
  implements FileViewProps {
  @computed
  get id() {
    return this.props.id;
  }

  @computed
  get file() {
    return getEntity<Item, FileItemModel>(ENTITY_NAME.FILE_ITEM, this.id);
  }

  @computed
  get downloadUrl() {
    return this.file.downloadUrl;
  }

  @computed
  get _person(): any {
    const { creatorId } = this.file;
    if (creatorId) {
      return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, creatorId);
    }
    return {};
  }

  @computed
  get personName() {
    return this._person.userDisplayName || '';
  }

  @computed
  get createdTime() {
    const { createdAt } = this.file;
    return dateFormatter.date(createdAt);
  }
}

export { FileViewModel };
