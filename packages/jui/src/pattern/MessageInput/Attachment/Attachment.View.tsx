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
import { translate, WithNamespaces } from 'react-i18next';
import { AttachmentViewProps } from './types';
import { JuiIconButton } from '../../../components/Buttons';
import { JuiMenu, JuiMenuItem } from '../../../components';
import { withUploadFile } from '../../../hoc/withUploadFile';

type Props = AttachmentViewProps & WithNamespaces;

@withUploadFile
class UploadArea extends PureComponent<any> {
  render() {
    return <div />;
  }
}

@observer
class AttachmentViewComponent extends Component<Props> {
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
    const ref = this._uploadRef.current;
    if (ref) {
      ref.showFileDialog();
    }
  }

  render() {
    const { t, onFileChanged } = this.props;
    const { anchorEl } = this.state;
    return (
      <Fragment>
        <JuiIconButton
          tooltipTitle={t('ShareFiles')}
          onClick={this._handleClickEvent}
          size="medium"
        >
          attachment
        </JuiIconButton>
        <UploadArea onFileChanged={onFileChanged} ref={this._uploadRef} />
        <JuiMenu
          id="conversation-chatbar-attachment-menu"
          anchorEl={anchorEl}
          open={!!anchorEl}
        >
          <JuiMenuItem
            data-test-automation-id="chatbar-attchment-selectfile"
            onClick={this._hideMenu}
          >
            Share File
          </JuiMenuItem>
        </JuiMenu>
      </Fragment>
    );
  }
}

const AttachmentView = translate('Conversations')(AttachmentViewComponent);

export { AttachmentView };
