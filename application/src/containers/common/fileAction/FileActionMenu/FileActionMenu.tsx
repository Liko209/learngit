/*
 * @Author: wayne.zhou
 * @Date: 2019-05-27 14:31:37
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiIconButton, IconButtonVariant } from 'jui/components/Buttons';
import { FileDeleteAction, FileDeleteActionProps } from '../FileDeleteAction';
import {
  FileNameEditAction,
  FileNameEditActionProps,
} from '../FileNameEditAction';
import { JuiMenuList } from 'jui/components/Menus';
import { JuiPopperMenu, AnchorProps } from 'jui/pattern/PopperMenu';
import { WithTranslation, withTranslation } from 'react-i18next';

type Props = {
  fileId: number;
  postId?: number;
  disablePortal?: boolean;
  variant?: IconButtonVariant;
} & FileDeleteActionProps &
  FileNameEditActionProps &
  WithTranslation;

type State = { open: boolean; anchorEl: EventTarget | null };
class Component extends React.Component<Props, State> {
  state = {
    open: false,
    anchorEl: null,
  };
  private _Anchor = ({ tooltipForceHide }: AnchorProps) => {
    const { t } = this.props;
    return (
      <JuiIconButton
        size="medium"
        ariaLabel={t('common.more')}
        variant={this.props.variant || 'plain'}
        data-test-automation-id="fileActionMore"
        tooltipTitle={t('common.more')}
        onClick={this.openPopper}
        tooltipForceHide={tooltipForceHide}
      >
        more_vert
      </JuiIconButton>
    );
  }

  openPopper = (evt: React.MouseEvent) => {
    const { currentTarget } = evt;
    this.setState(state => ({
      anchorEl: currentTarget,
      open: !state.open,
    }));
  }

  closePopper = () => {
    this.setState({
      open: false,
    });
  }
  render() {
    const { fileId, postId, disablePortal, ...rest } = this.props;
    return (
      <JuiPopperMenu
        Anchor={this._Anchor}
        open={this.state.open}
        anchorEl={this.state.anchorEl}
        onClose={this.closePopper}
        disablePortal={disablePortal}
        data-test-automation-id={'fileActionMenu'}
      >
        <JuiMenuList data-test-automation-id={'fileActionMenuList'}>
          <FileNameEditAction fileId={fileId} postId={postId} {...rest} />
          <FileDeleteAction fileId={fileId} postId={postId} {...rest} />
        </JuiMenuList>
      </JuiPopperMenu>
    );
  }
}

const FileActionMenu = withTranslation('translations')(Component);

export { FileActionMenu, Props };
