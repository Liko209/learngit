/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 19:18:07
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { observer } from 'mobx-react';
import { translate } from 'react-i18next';
import { JuiConversationItemCard } from 'jui/pattern/ConversationItemCard';
import { JuiTaskCheckbox } from 'jui/pattern/ConversationItemCard/ConversationItemCardHeader';
import {
  JuiTaskSection,
  JuiTaskNotes,
  JuiTaskAvatarName,
  JuiTaskContent,
} from 'jui/pattern/ConversationItemCard/ConversationItemCardBody';
import { JuiIconButton } from 'jui/components/Buttons/IconButton';
import {
  JuiFileWithExpand,
  JuiExpandImage,
} from 'jui/pattern/ConversationCard/Files';

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

const FILE_COMPS = {
  [FileType.image]: (file: ExtendFileItem, props: ViewProps) => {
    const { item, previewUrl } = file;
    const { id, name, downloadUrl } = item;
    return (
      <JuiExpandImage
        key={id}
        previewUrl={previewUrl}
        fileName={name}
        actions={<>{downloadBtn(downloadUrl)}</>}
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
class Task extends React.Component<ViewProps> {
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
    const { task, files, t } = this.props;
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
          tOther={
            assigned_to_ids && assigned_to_ids.length
              ? t('avatarnamesWithOthers', {
                count: assigned_to_ids.length - 2,
              })
              : ''
          }
        />
        <JuiTaskContent>
          <JuiTaskSection section={section} />
          <JuiTaskNotes notes={notes} />
        </JuiTaskContent>
        {files && files.length > 0 && (
          <JuiTaskContent title={t('Attachments')}>
            {files.map((file: ExtendFileItem) => {
              return FILE_COMPS[file.type](file, this.props);
            })}
          </JuiTaskContent>
        )}
      </JuiConversationItemCard>
    );
  }
}

const TaskView = translate('translations')(Task);

export { TaskView };
