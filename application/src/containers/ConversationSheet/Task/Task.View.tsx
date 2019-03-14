/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 19:18:07
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import i18next from 'i18next';
import { JuiConversationItemCard } from 'jui/pattern/ConversationItemCard';
import { JuiTaskCheckbox } from 'jui/pattern/ConversationItemCard/ConversationItemCardHeader';
import {
  JuiTaskSectionOrDescription,
  JuiTaskAvatarNames,
  JuiTaskContent,
  JuiTimeMessage,
} from 'jui/pattern/ConversationItemCard/ConversationItemCardBody';
import {
  JuiFileWithExpand,
  JuiExpandImage,
} from 'jui/pattern/ConversationCard/Files';
import { showImageViewer } from '@/containers/Viewer';

import { AvatarName } from './AvatarName';
import { getDurationTimeText } from '../helper';
import { ViewProps, FileType, ExtendFileItem } from './types';
import { getFileIcon } from '@/common/getFileIcon';
import { Download } from '@/containers/common/Download';

type taskViewProps = WithNamespaces & ViewProps;

const FILE_COMPS = {
  [FileType.image]: (
    file: ExtendFileItem,
    props: ViewProps,
    handleImageClick: (
      groupId: number,
      id: number,
      origWidth: number,
      origHeight: number,
    ) => (ev: React.MouseEvent, loaded: boolean) => void,
  ) => {
    const { item, previewUrl } = file;
    const { groupId } = props;
    const {
      origHeight,
      id,
      origWidth,
      name,
      downloadUrl,
      deactivated,
      type,
    } = item;
    return (
      !deactivated && (
        <JuiExpandImage
          icon={getFileIcon(type)}
          key={id}
          previewUrl={previewUrl}
          fileName={name}
          i18UnfoldLess={i18next.t('common.collapse')}
          i18UnfoldMore={i18next.t('common.expand')}
          handleImageClick={handleImageClick(
            groupId,
            id,
            origWidth,
            origHeight,
          )}
          Actions={<Download url={downloadUrl} />}
          ImageActions={<Download url={downloadUrl} />}
        />
      )
    );
  },
  [FileType.others]: (file: ExtendFileItem) => {
    const { item } = file;
    const { name, downloadUrl, id, deactivated, type } = item;
    return (
      !deactivated && (
        <JuiFileWithExpand
          icon={getFileIcon(type)}
          key={id}
          fileName={name}
          Actions={<Download url={downloadUrl} />}
        />
      )
    );
  },
};

@observer
class Task extends React.Component<taskViewProps> {
  private get _taskAvatarNames() {
    const { task } = this.props;
    const { assignedToIds } = task;

    const assignedIds = assignedToIds ? assignedToIds.slice(0, 2) : [];

    return assignedIds.map((assignedId: number) => (
      <AvatarName key={assignedId} id={assignedId} />
    ));
  }

  _handleImageClick = (
    groupId: number,
    id: number,
    origWidth: number,
    origHeight: number,
  ) => async (ev: React.MouseEvent, loaded?: boolean) => {
    const target = ev.currentTarget as HTMLElement;
    const canShowDialogPermission = await this.props.getShowDialogPermission();
    if (!canShowDialogPermission) {
      return;
    }
    return await showImageViewer(groupId, id, target);
  }

  private _getTitleText(text: string) {
    const { task } = this.props;
    const {
      completeType,
      completePeopleIds,
      assignedToIds,
      completePercentage,
    } = task;

    switch (completeType) {
      case 'all':
        return `${completePeopleIds ? completePeopleIds.length : 0}/${
          assignedToIds.length
        } ${text}`;
      case 'percentage':
        return `${completePercentage || 0}% ${text}`;
      default:
        return text;
    }
  }

  render() {
    const {
      task,
      files,
      startTime,
      endTime,
      hasTime,
      color,
      t,
      notes,
      section,
    } = this.props;
    const {
      text,
      complete,
      assignedToIds,
      repeat,
      repeatEndingAfter,
      repeatEnding,
      repeatEndingOn,
    } = task;
    const timeText = getDurationTimeText(
      repeat,
      repeatEndingAfter,
      repeatEndingOn,
      repeatEnding,
    );

    return (
      <JuiConversationItemCard
        complete={complete}
        title={this._getTitleText(text)}
        titleColor={color}
        Icon={<JuiTaskCheckbox checked={complete || false} />}
      >
        {endTime && (
          <JuiTaskContent title={t('item.due')}>
            <JuiTimeMessage
              time={`${startTime} ${hasTime ? '-' : ''} ${endTime} ${timeText}`}
            />
          </JuiTaskContent>
        )}

        {assignedToIds && assignedToIds.length > 0 && (
          <JuiTaskContent title={t('item.assignee')}>
            <JuiTaskAvatarNames
              count={assignedToIds && assignedToIds.length}
              otherText={t('item.avatarNamesWithOthers', {
                count: assignedToIds.length - 2,
              })}
            >
              {this._taskAvatarNames}
            </JuiTaskAvatarNames>
          </JuiTaskContent>
        )}
        {section && (
          <JuiTaskContent title={t('item.section')}>
            <JuiTaskSectionOrDescription text={section} />
          </JuiTaskContent>
        )}
        {notes && (
          <JuiTaskContent title={t('item.descriptionNotes')}>
            <JuiTaskSectionOrDescription text={notes} />
          </JuiTaskContent>
        )}
        {files && files.length > 0 && (
          <JuiTaskContent title={t('item.attachments')}>
            {files.map((file: ExtendFileItem) => {
              return FILE_COMPS[file.type](
                file,
                this.props,
                this._handleImageClick,
              );
            })}
          </JuiTaskContent>
        )}
      </JuiConversationItemCard>
    );
  }
}

const TaskView = translate('translations')(Task);

export { TaskView };
