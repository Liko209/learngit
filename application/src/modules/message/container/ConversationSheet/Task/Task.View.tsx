/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 19:18:07
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiConversationItemCard } from 'jui/pattern/ConversationItemCard';
import { JuiTaskCheckbox } from 'jui/pattern/ConversationItemCard/ConversationItemCardHeader';
import {
  JuiLabelWithContent,
  JuiTaskSectionOrDescription,
  JuiTaskAvatarNames,
  JuiTimeMessage,
} from 'jui/pattern/ConversationItemCard/ConversationItemCardBody';
import {
  JuiFileWithExpand,
  JuiExpandImage,
  JuiFileWrapper,
} from 'jui/pattern/ConversationCard/Files';
import { showImageViewer } from '@/containers/Viewer';

import { AvatarName } from './AvatarName';
import { getDurationTimeText } from '../helper';
import { ViewProps, FileType, ExtendFileItem } from './types';
import { getFileIcon } from '@/common/getFileIcon';
import { Download } from '@/containers/common/Download';

type taskViewProps = WithTranslation & ViewProps;

const FILE_COMPS = {
  [FileType.image]: (
    file: ExtendFileItem,
    props: taskViewProps,
    handleImageClick: (
      groupId: number,
      id: number,
      url: string,
      origWidth: number,
      origHeight: number,
    ) => (ev: React.MouseEvent, loaded: boolean) => void,
  ) => {
    const { item, previewUrl } = file;
    const { groupId, t } = props;
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
          i18UnfoldLess={t('common.collapse')}
          i18UnfoldMore={t('common.expand')}
          handleImageClick={handleImageClick(
            groupId,
            id,
            previewUrl,
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
    const { effectiveIds } = this.props;

    const assignedIds = effectiveIds ? effectiveIds.slice(0, 2) : [];

    return assignedIds.map((assignedId: number) => (
      <AvatarName key={assignedId} id={assignedId} />
    ));
  }

  _handleImageClick = (
    groupId: number,
    id: number,
    url: string,
    origWidth: number,
    origHeight: number,
  ) => async (ev: React.MouseEvent, loaded?: boolean) => {
    const target = ev.currentTarget as HTMLElement;

    return await showImageViewer(groupId, id, {
      originElement: target,
      thumbnailSrc: url,
      initialWidth: origWidth,
      initialHeight: origHeight,
    });
  }

  private _getTitleText(text: string) {
    const { task, effectiveIds } = this.props;
    const {
      completeType,
      completePeopleIds,
      completePercentage,
    } = task;

    switch (completeType) {
      case 'all':
        return `${completePeopleIds ? completePeopleIds.length : 0}/${
          effectiveIds.length
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
      effectiveIds,
    } = this.props;
    const {
      text,
      complete,
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
        Icon={
          <JuiTaskCheckbox customColor={color} checked={complete || false} />}
      >
        {endTime && (
          <JuiLabelWithContent label={t('item.due')}>
            <JuiTimeMessage
              time={`${startTime} ${hasTime ? '-' : ''} ${endTime} ${timeText}`}
            />
          </JuiLabelWithContent>
        )}

        {effectiveIds && effectiveIds.length > 0 && (
          <JuiLabelWithContent label={t('item.assignee')}>
            <JuiTaskAvatarNames
              count={effectiveIds && effectiveIds.length}
              otherText={t('item.avatarNamesWithOthers', {
                count: effectiveIds.length - 2,
              })}
            >
              {this._taskAvatarNames}
            </JuiTaskAvatarNames>
          </JuiLabelWithContent>
        )}
        {section && (
          <JuiLabelWithContent label={t('item.section')}>
            <JuiTaskSectionOrDescription text={section} />
          </JuiLabelWithContent>
        )}
        {notes && (
          <JuiLabelWithContent label={t('item.descriptionNotes')}>
            <JuiTaskSectionOrDescription text={notes} />
          </JuiLabelWithContent>
        )}
        {files && files.length > 0 && (
          <JuiLabelWithContent label={t('item.attachments')}>
            <JuiFileWrapper>
              {files.map((file: ExtendFileItem) => {
                return FILE_COMPS[file.type](
                  file,
                  this.props,
                  this._handleImageClick,
                );
              })}
            </JuiFileWrapper>
          </JuiLabelWithContent>
        )}
      </JuiConversationItemCard>
    );
  }
}

const TaskView = withTranslation('translations')(Task);

export { TaskView };
