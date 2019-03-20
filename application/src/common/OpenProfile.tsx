/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-02-28 18:04:11
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { Dialog } from '@/containers/Dialog';
import {
  ProfileDialogGroup,
  ProfileDialogPerson,
} from '@/containers/Profile/Dialog';
import { TypeDictionary, GlipTypeUtil } from 'sdk/utils';

const getProfileDialogComponent = (id: number) => {
  const typeId = GlipTypeUtil.extractTypeId(id);

  const MappingComponent = {
    [TypeDictionary.TYPE_ID_PERSON]: ProfileDialogPerson,
    [TypeDictionary.TYPE_ID_GROUP]: ProfileDialogGroup,
    [TypeDictionary.TYPE_ID_TEAM]: ProfileDialogGroup,
  };
  return MappingComponent[typeId];
};

class OpenProfile {
  static _dismiss: Function;
  static show(
    id: number,
    beforeClick?: (() => void) | null,
    afterClick?: () => void,
  ) {
    const ProfileDialog = getProfileDialogComponent(id);
    beforeClick && beforeClick();

    if (this._dismiss) {
      this._dismiss();
    }
    const { dismiss } = Dialog.simple(<ProfileDialog id={id} />, {
      size: 'medium',
    });
    afterClick && afterClick();

    this._dismiss = dismiss;
  }
}

export { OpenProfile };
