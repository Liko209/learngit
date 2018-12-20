/*
 * @Author: isaac.liu (isaac.liu@ringcentral.com)
 * @Date: 2018-12-06 15:53:09
 * Copyright © RingCentral. All rights reserved.
 */

import React, {
  Component,
  MouseEvent,
  Fragment,
  PureComponent,
  RefObject,
  createRef,
} from 'react';
import { observer } from 'mobx-react';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { AttachmentViewProps } from './types';
import { JuiIconButton } from '../../../components/Buttons';
import {
  JuiMenu,
  JuiMenuItem,
  JuiMenuList,
  JuiDivider,
} from '../../../components';
import {
  JuiAttachmentIcon,
  JuiGoogleDriveIcon,
  JuiDropboxIcon,
  JuiOneboxIcon,
  JuiOneDriveIcon,
  JuiEvernoteIcon,
} from '../../../foundation/Iconography';
import { withUploadFile } from '../../../hoc/withUploadFile';

type Props = AttachmentViewProps;

@withUploadFile
class UploadArea extends PureComponent<any> {
  render() {
    return <div />;
  }
}

@observer
class AttachmentView extends Component<Props> {
  state = {
    anchorEl: null,
  };

  private _uploadRef: RefObject<any> = createRef();

  private _handleClickEvent = (evt: MouseEvent) => {
    evt.stopPropagation();
    this.setState({ anchorEl: evt.currentTarget });
  }

  private _hideMenu = () => {
    this.setState({ anchorEl: null });
  }

  private _hideMenuAndShowDialog = () => {
    this._hideMenu();
    const ref = this._uploadRef.current;
    if (ref) {
      ref.showFileDialog();
    }
  }

  render() {
    const { onFileChanged } = this.props;
    const { anchorEl } = this.state;
    const open = !!anchorEl;
    const viewBox = '0 0 16 16';
    const menus = [
      {
        icon: <JuiGoogleDriveIcon viewBox={viewBox} />,
        label: 'Google Drive',
      },
      {
        icon: <JuiDropboxIcon viewBox={viewBox} />,
        label: 'Dropbox',
      },
      {
        icon: <JuiOneboxIcon viewBox={viewBox} />,
        label: 'Box',
      },
      {
        icon: <JuiEvernoteIcon viewBox={viewBox} />,
        label: 'Evernote',
      },
      {
        icon: <JuiOneDriveIcon viewBox={viewBox} />,
        label: 'OneDrive',
      },
    ];
    return (
      <Fragment>
        <JuiIconButton
          data-test-automation-id="conversation-chatbar-attachment-button"
          tooltipTitle="Attach file"
          onClick={this._handleClickEvent}
          size="medium"
        >
          <JuiAttachmentIcon viewBox="-2 -2 24 24" />
        </JuiIconButton>
        <UploadArea onFileChanged={onFileChanged} ref={this._uploadRef} />
        {open && (
          <JuiMenu
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'center',
              horizontal: 'left',
            }}
            data-test-automation-id="conversation-chatbar-attachment-menu"
            anchorEl={anchorEl}
            open={open}
          >
            <JuiMenuItem disabled={true} divider={true}>
              Upload files from
            </JuiMenuItem>
            <JuiMenuList>
              {menus.map(({ icon, label }, idx) => (
                <JuiMenuItem disabled={true} icon={icon} key={idx}>
                  {label}
                </JuiMenuItem>
              ))}
            </JuiMenuList>
            <JuiDivider />
            <JuiMenuList>
              <ClickAwayListener onClickAway={this._hideMenu}>
                <JuiMenuItem
                  disableGutters={true}
                  icon="computer"
                  data-test-automation-id="chatbar-attchment-selectfile"
                  onClick={this._hideMenuAndShowDialog}
                >
                  Computer
                </JuiMenuItem>
              </ClickAwayListener>
            </JuiMenuList>
          </JuiMenu>
        )}
      </Fragment>
    );
  }
}

export { AttachmentView };
