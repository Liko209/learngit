/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 19:18:07
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiConversationItemCard } from 'jui/pattern/ConversationItemCard';
import { JuiTaskCheckbox } from 'jui/pattern/ConversationItemCard/ConversationItemCardHeader';
import {
  JuiLabelWithContent,
  JuiTaskSectionOrDescription,
  JuiTaskAvatarNames,
  JuiTimeMessage,
  JuiSectionDivider,
} from 'jui/pattern/ConversationItemCard/ConversationItemCardBody';
import {
  JuiFileWithExpand,
  JuiExpandImage,
  JuiFileWrapper,
} from 'jui/pattern/ConversationCard/Files';
import { container } from 'framework/ioc';
import { IViewerService, VIEWER_SERVICE } from '@/modules/viewer/interface';

import { AvatarName } from './AvatarName';
import { ViewProps, FileType, ExtendFileItem } from './types';
import { getFileIcon } from '@/common/getFileIcon';
import { Download } from '@/containers/common/Download';
import {
  postParser,
  HighlightContextInfo,
  SearchHighlightContext,
} from '@/common/postParser';

type taskViewProps = WithTranslation & ViewProps;

const FILE_COMPS = {
  [FileType.image]: (
    file: ExtendFileItem,
    props: taskViewProps,
    keyword: string,
    handleImageClick: (
      groupId: number,
      id: number,
      url: string,
      origWidth: number,
      origHeight: number,
    ) => (ev: React.MouseEvent, loaded: boolean) => void,
    initialExpansionStatus: boolean,
    switchExpandHandler: (isExpanded: boolean) => void,
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
          fileID={id}
          icon={getFileIcon(type)}
          key={id}
          previewUrl={previewUrl}
          fileName={postParser(name, {
            keyword,
            fileName: true,
          })}
          i18UnfoldLess={t('common.collapse')}
          i18UnfoldMore={t('common.expand')}
          defaultExpansionStatus={initialExpansionStatus}
          handleImageClick={handleImageClick(
            groupId,
            id,
            previewUrl,
            origWidth,
            origHeight,
          )}
          Actions={<Download url={downloadUrl} />}
          ImageActions={<Download url={downloadUrl} key="downloadAction" />}
          onSwitchExpand={switchExpandHandler}
        />
      )
    );
  },
  [FileType.others]: (
    file: ExtendFileItem,
    props: taskViewProps,
    keyword: string,
  ) => {
    const { item } = file;
    const { name, downloadUrl, id, deactivated, type } = item;
    return (
      !deactivated && (
        <JuiFileWithExpand
          icon={getFileIcon(type)}
          key={id}
          fileName={postParser(name, {
            keyword,
            fileName: true,
          })}
          Actions={<Download url={downloadUrl} />}
        />
      )
    );
  },
};

@observer
class Task extends React.Component<taskViewProps> {
  _viewerService: IViewerService = container.get(VIEWER_SERVICE);
  static contextType = SearchHighlightContext;
  context: HighlightContextInfo;
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
  ) => async (ev: React.MouseEvent) => {
    const target = ev.currentTarget as HTMLElement;
    return await this._viewerService.showImageViewer(groupId, id, {
      originElement: target,
      thumbnailSrc: url,
      initialWidth: origWidth,
      initialHeight: origHeight,
    });
  };

  private _getTitleText(text: string) {
    const { task, effectiveIds } = this.props;
    const { completeType, completePeopleIds, completePercentage } = task;

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
      timeText,
      initialExpansionStatus,
      switchExpandHandler,
    } = this.props;
    const { text, complete } = task;
    const hasContent =
      endTime.get() ||
      (effectiveIds && effectiveIds.length > 0) ||
      section ||
      notes ||
      (files && files.length > 0);

    return (
      <JuiConversationItemCard
        complete={complete}
        title={postParser(this._getTitleText(text), {
          keyword: this.context.keyword,
        })}
        contentHasPadding={!!hasContent}
        customColor={color}
        Icon={
          <JuiTaskCheckbox customColor={color} checked={complete || false} />
        }
      >
        <JuiSectionDivider gap={2}>
          {endTime.get() && (
            <JuiLabelWithContent label={t('item.due')}>
              <JuiTimeMessage
                time={`${startTime.get()} ${
                  hasTime ? '-' : ''
                } ${endTime.get()} ${timeText.get()}`}
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
              <JuiTaskSectionOrDescription data-test-automation-id="task-section">
                {postParser(section, {
                  keyword: this.context.keyword,
                })}
              </JuiTaskSectionOrDescription>
            </JuiLabelWithContent>
          )}
          {notes && (
            <JuiLabelWithContent label={t('item.descriptionNotes')}>
              <JuiTaskSectionOrDescription data-test-automation-id="task-description">
                {postParser(notes, {
                  keyword: this.context.keyword,
                  phoneNumber: true,
                  url: true,
                })}
              </JuiTaskSectionOrDescription>
            </JuiLabelWithContent>
          )}
          {files && files.length > 0 && (
            <JuiLabelWithContent label={t('item.attachments')}>
              <JuiFileWrapper data-test-automation-id="task-attachments">
                {files.map((file: ExtendFileItem) =>
                  FILE_COMPS[file.type]
                    ? FILE_COMPS[file.type](
                        file,
                        this.props,
                        this.context.keyword,
                        this._handleImageClick,
                        initialExpansionStatus,
                        switchExpandHandler,
                      )
                    : null,
                )}
              </JuiFileWrapper>
            </JuiLabelWithContent>
          )}
        </JuiSectionDivider>
      </JuiConversationItemCard>
    );
  }
}

const TaskView = withTranslation('translations')(Task);

export { TaskView };
