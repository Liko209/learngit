/*
 * @Author: wayne.zhou
 * @Date: 2019-05-27 14:31:37
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiIconButton } from 'jui/components/Buttons';
import { FileDeleteOption } from '../FileDeleteOption';
import { JuiMenuList } from 'jui/components/Menus';
import { JuiPopperMenu, AnchorProps } from 'jui/pattern/PopperMenu';
import { WithTranslation, withTranslation } from 'react-i18next';

type FileOptionMenuProps = {
  fileId: number;
  postId?: number;
  disablePortal?: boolean;
} & WithTranslation;

type State = { open: boolean; anchorEl: EventTarget | null };
class FileOptionMenuComponent extends React.Component<
  FileOptionMenuProps,
  State
> {
  state = {
    open: false,
    anchorEl: null,
  };
  private _Anchor = ({ tooltipForceHide }: AnchorProps) => {
    return (
      <JuiIconButton
        size="medium"
        variant="plain"
        data-test-automation-id="fileActionMore"
        tooltipTitle={this.props.t('common.more')}
        onClick={this.openPopper}
        tooltipForceHide={tooltipForceHide}
      >
        more_horiz
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
    const { fileId, postId, disablePortal } = this.props;
    return (
      <JuiPopperMenu
        Anchor={this._Anchor}
        open={this.state.open}
        anchorEl={this.state.anchorEl}
        onClose={this.closePopper}
        disablePortal={disablePortal}
      >
        <JuiMenuList>
          <FileDeleteOption fileId={fileId} postId={postId} />
        </JuiMenuList>
      </JuiPopperMenu>
    );
  }
}

const FileOptionMenu = withTranslation('translations')(FileOptionMenuComponent);

export { FileOptionMenu, FileOptionMenuProps };
