/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component, MouseEvent } from 'react';
import { OpenProfileDialogProps, OpenProfileDialogViewProps } from './types';
import { TypeDictionary } from 'sdk/utils';
import {
  ProfileDialogGroup,
  ProfileDialogPerson,
} from '@/containers/Profile/Dialog';
import { Dialog } from '@/containers/Dialog';

type Props = OpenProfileDialogProps & OpenProfileDialogViewProps;

class OpenProfileDialogView extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  private _onClickOpenProfileDialog = (event: MouseEvent<HTMLElement>) => {
    const { id, beforeClick, afterClick } = this.props;
    const ProfileDialog = this._getProfileDialogComponent();
    beforeClick && beforeClick(event);
    Dialog.simple(<ProfileDialog id={id} />, {
      size: 'medium',
    });
    afterClick && afterClick(event);
  }

  private _getProfileDialogComponent = () => {
    const { typeId } = this.props;
    const MappingComponent = {
      [TypeDictionary.TYPE_ID_PERSON]: ProfileDialogPerson,
      [TypeDictionary.TYPE_ID_GROUP]: ProfileDialogGroup,
      [TypeDictionary.TYPE_ID_TEAM]: ProfileDialogGroup,
    };
    return MappingComponent[typeId];
  }

  render() {
    const { children } = this.props;
    return <span onClick={this._onClickOpenProfileDialog}>{children}</span>;
  }
}

export { OpenProfileDialogView };
