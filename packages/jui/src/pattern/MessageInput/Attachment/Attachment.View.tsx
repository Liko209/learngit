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
import styled from '../../../foundation/styled-components';
import {
  JuiMenu,
  JuiMenuItem,
  JuiMenuList,
  JuiDivider,
} from '../../../components';
import { JuiIconography } from '../../../foundation/Iconography';
import { withUploadFile } from '../../../hoc/withUploadFile';

const Menu = styled(JuiMenu)`
  .menu-list-root {
    padding: 0;
  }
`;

const MenuList = styled(JuiMenuList)`
  && {
    padding: 0;
  }
`;

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
    setTimeout(() => {
      const ref = this._uploadRef.current;
      if (ref) {
        ref.showFileDialog();
      }
    },         0);
  }

  render() {
    const { onFileChanged } = this.props;
    const { anchorEl } = this.state;
    const open = !!anchorEl;
    const menus = [
      {
        icon: <JuiIconography>google</JuiIconography>,
        label: 'Google Drive',
      },
      {
        icon: <JuiIconography>dropbox</JuiIconography>,
        label: 'Dropbox',
      },
      {
        icon: <JuiIconography>box</JuiIconography>,
        label: 'Box',
      },
      {
        icon: <JuiIconography>evernote</JuiIconography>,
        label: 'Evernote',
      },
      {
        icon: <JuiIconography>onedrive</JuiIconography>,
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
          attachment
        </JuiIconButton>
        <UploadArea onFileChanged={onFileChanged} ref={this._uploadRef} />
        {open && (
          <Menu
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
            MenuListProps={{
              classes: {
                root: 'menu-list-root',
              },
            }}
            open={open}
          >
            <JuiMenuItem disabled={true} divider={true}>
              Upload files from
            </JuiMenuItem>
            <MenuList>
              {menus.map(({ icon, label }, idx) => (
                <JuiMenuItem disabled={true} icon={icon} key={idx}>
                  {label}
                </JuiMenuItem>
              ))}
            </MenuList>
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
          </Menu>
        )}
      </Fragment>
    );
  }
}

export { AttachmentView };
