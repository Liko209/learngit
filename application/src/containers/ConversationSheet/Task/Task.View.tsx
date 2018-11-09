/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 19:18:07
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { observer } from 'mobx-react';
import { JuiConversationItemCard } from 'jui/pattern/ConversationItemCard';
import { JuiTaskCheckbox } from 'jui/pattern/ConversationItemCard/ConversationItemCardHeader';
import {
  JuiTaskSection,
  JuiTaskNotes,
  JuiTaskAvatarName,
} from 'jui/pattern/ConversationItemCard/ConversationItemCardBody';
import { JuiIconButton } from 'jui/components/Buttons/IconButton';
import {
  JuiFileWithPreview,
  JuiFileWithExpand,
  JuiPreviewImage,
} from 'jui/pattern/ConversationCard/Files';
import { getFileSize } from '@/utils/helper';

import { AvatarName } from './AvatarName';
import { ViewProps, FileType, ExtendFileItem } from './types';

const downloadBtn = (downloadUrl: string) => (
  <JuiIconButton
    component="a"
    download={true}
    href={downloadUrl}
    variant="plain"
    tooltipTitle="download"
  >
    get_app
  </JuiIconButton>
);

const File_COMPS = {
  [FileType.image]: (file: ExtendFileItem) => {
    const { item, previewUrl } = file;
    const { id, name, downloadUrl } = item;

    return (
      <JuiFileWithExpand
        key={id}
        fileName={name}
        actions={
          <>
            {downloadBtn(downloadUrl)}
            <JuiIconButton
              variant="plain"
              tooltipTitle="expand"
            >
              event
            </JuiIconButton>
          </>
        }
      >
        <JuiPreviewImage
          ratio={1}
          fileName={name}
          url={previewUrl}
          actions={downloadBtn(downloadUrl)}
        />
      </JuiFileWithExpand>
    );
  },
  [FileType.document]: (file: ExtendFileItem, props: ViewProps) => {
    const { item, previewUrl } = file;
    const { size, type, id, name, downloadUrl } = item;
    const iconType = item.getFileIcon(type);
    return (
      <JuiFileWithPreview
        key={id}
        fileName={name}
        size={`${getFileSize(size)}`}
        url={previewUrl}
        iconType={iconType}
        actions={downloadBtn(downloadUrl)}
      />
    );
  },
  [FileType.others]: (file: ExtendFileItem) => {
    const { item } = file;
    const { name, downloadUrl, id } = item;
    return (
      <JuiFileWithExpand
        key={id}
        fileName={name}
        actions={downloadBtn(downloadUrl)}
      />
    );
  },
};

@observer
class TaskView extends React.Component<ViewProps> {

  private get _taskAvatarNames() {
    const { task } = this.props;
    const { assigned_to_ids } = task;

    if (assigned_to_ids && assigned_to_ids.length >= 2) {
      return [
        <AvatarName key={assigned_to_ids[0]} id={assigned_to_ids[0]} />,
        <AvatarName key={assigned_to_ids[1]} id={assigned_to_ids[1]} />,
      ];
    }

    return assigned_to_ids && <AvatarName id={assigned_to_ids[0]} />;
  }

  render() {
    const { task, files } = this.props;
    const { section, color, text, notes, complete, assigned_to_ids } = task;
    console.log(files, '-----files');
    return (
      <JuiConversationItemCard
        complete={complete}
        title={text}
        titleColor={color}
        icon={<JuiTaskCheckbox checked={complete} />}
      >
        <JuiTaskAvatarName
          avatarNames={this._taskAvatarNames}
          count={assigned_to_ids && assigned_to_ids.length}
        />
        <JuiTaskSection section={section} />
        <JuiTaskNotes notes={notes} />
        <JuiTaskSection section={'Attachments'} />
        {files.map((file: ExtendFileItem) => {
          return File_COMPS[file.type](file, this.props);
        })}
      </JuiConversationItemCard>
    );
  }
}

export { TaskView };
