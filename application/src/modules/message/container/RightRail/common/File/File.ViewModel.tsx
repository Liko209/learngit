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
import { FileProps, FileViewModelProps } from './File.types';

class FileViewModel<P = {}> extends AbstractViewModel<FileProps & P>
  implements FileViewModelProps {
  @computed
  get file() {
    return getEntity<Item, FileItemModel>(ENTITY_NAME.ITEM, this.props.id) || {};
  }

  @computed
  get fileName() {
    return this.file.name;
  }

  @computed
  get downloadUrl() {
    return this.file.downloadUrl;
  }

  @computed
  get _person(): any {
    const creatorId =
      this.file.latestVersion && this.file.latestVersion.creator_id;
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
  get modifiedTime() {
    const { createdAt } = this.file;
    const modifiedTime =
      this.file.latestVersion && this.file.latestVersion.date;
    if (modifiedTime && typeof modifiedTime === 'number') {
      return dateFormatter.date(modifiedTime);
    }
    return dateFormatter.date(createdAt);
  }
}

export { FileViewModel };
