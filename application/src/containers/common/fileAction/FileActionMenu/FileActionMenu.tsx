/*
 * @Author: wayne.zhou
 * @Date: 2019-05-27 14:31:37
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { JuiIconButton, IconButtonVariant } from 'jui/components/Buttons';
import { FileDeleteAction, FileDeleteActionProps } from '../FileDeleteAction';
import {
  FileNameEditAction,
  FileNameEditActionProps,
} from '../FileNameEditAction';
import { ViewInBrowserTabAction } from '../ViewInBrowserTab';
import { ViewInPostAction } from '../ViewInPostAction';
import { JuiMenuList } from 'jui/components/Menus';
import { JuiPopperMenu, AnchorProps } from 'jui/pattern/PopperMenu';
import { WithTranslation, withTranslation } from 'react-i18next';
import { FileShareAction } from '../FileShareAction/FileShareAction';
import { IFileActionBaseViewModel } from '../common/types';
import { observer } from 'mobx-react';
import { getFileType } from '@/common/getFileType';
import { FileType } from '@/store/models/FileItem';
import { Scene } from '../dataTrackings';

type FileActionMenuProps = {
  fileId: number;
  postId?: number;
  disablePortal?: boolean;
  variant?: IconButtonVariant;
  showViewInPostAction?: boolean;
  groupId: number;
  asyncOperationDecorator?: FunctionDecorator;
  scene: Scene;
} & FileDeleteActionProps &
  FileNameEditActionProps;

type State = { open: boolean; anchorEl: EventTarget | null };

type InnerComponentProps = FileActionMenuProps &
  WithTranslation &
  IFileActionBaseViewModel;
@observer
class InnerComponent extends Component<InnerComponentProps, State> {
  static defaultProps: Partial<InnerComponentProps> = {
    variant: 'plain',
    showViewInPostAction: false,
  };

  state = {
    open: false,
    anchorEl: null,
  };

  private _Anchor = ({ tooltipForceHide }: AnchorProps) => {
    const { t, variant } = this.props;
    return (
      <JuiIconButton
        size="medium"
        ariaLabel={t('common.more')}
        variant={variant}
        data-test-automation-id="fileActionMore"
        tooltipTitle={t('common.more')}
        onClick={this.openPopper}
        tooltipForceHide={tooltipForceHide}
      >
        more_vert
      </JuiIconButton>
    );
  };

  openPopper = (evt: React.MouseEvent) => {
    const { currentTarget } = evt;
    this.setState(state => ({
      anchorEl: currentTarget,
      open: !state.open,
    }));
  };

  closePopper = () => {
    this.setState({
      open: false,
    });
  };
  render() {
    const {
      showViewInPostAction,
      fileId,
      postId,
      groupId,
      disablePortal,
      asyncOperationDecorator,
      scene,
      item,
      ...rest
    } = this.props;
    const isImage = getFileType(item).type === FileType.image;
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
          <FileShareAction fileId={fileId} postId={postId} groupId={groupId} />
          {isImage && <ViewInBrowserTabAction scene={scene} item={item} />}
          <FileNameEditAction fileId={fileId} postId={postId} {...rest} />
          {showViewInPostAction && groupId && (
            <ViewInPostAction
              asyncOperationDecorator={asyncOperationDecorator}
              fileId={fileId}
              groupId={groupId}
            />
          )}
          <FileDeleteAction fileId={fileId} postId={postId} {...rest} />
        </JuiMenuList>
      </JuiPopperMenu>
    );
  }
}

const FileActionMenuView = withTranslation('translations')(InnerComponent);

export { FileActionMenuView, FileActionMenuProps };
