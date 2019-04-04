/*
 * @Author: isaac.liu
 * @Date: 2019-01-11 15:30:28
 * Copyright © RingCentral. All rights reserved.
 */
import { ComponentType } from 'react';
import { PinnedCell } from '../PinnedList/PinnedCell';
import { FileItem } from '../FileItem';
import { NoteItem } from '../NoteItem';
import { ImageItem } from '../ImageItem';
import { LinkItem } from '../LinkItem';
import { TaskItem } from '../TaskItem';
import { EventItem } from '../EventItem';

import FilesEmptyImage from '../images/Files.svg';
import EventsEmptyImage from '../images/Events.svg';
import ImagesEmptyImage from '../images/Images.svg';
import IntegrationsEmptyImage from '../images/Integration.svg';
import LinksEmptyImage from '../images/Links.svg';
import NotesEmptyImage from '../images/Notes.svg';
import PinnedEmptyImage from '../images/Pinned.svg';
import TasksEmptyImage from '../images/Tasks.svg';
import { RIGHT_RAIL_ITEM_TYPE } from './constants';
import { ITEM_SORT_KEYS } from 'sdk/module/item';

type EmptyConfig = {
  text: string;
  content: string;
  image: string;
};

type TabConfig = {
  title: string;
  type: RIGHT_RAIL_ITEM_TYPE;
  item: ComponentType;
  subheader: string;
  empty: EmptyConfig;
  sort?: {
    sortKey?: ITEM_SORT_KEYS;
    desc?: boolean;
  };
  automationID: string;
  offlinePrompt: string;
};

const TAB_CONFIG: TabConfig[] = [
  {
    title: 'item.pinned',
    type: RIGHT_RAIL_ITEM_TYPE.PIN_POSTS,
    item: PinnedCell,
    subheader: 'item.pinnedListSubheader',
    empty: {
      text: 'item.youHaveNothingPinnedYet',
      content: 'item.noPinSubText',
      image: PinnedEmptyImage,
    },
    automationID: 'pinned',
    offlinePrompt: 'item.networkErrorPinnedPrompt',
  },
  {
    title: 'item.files',
    type: RIGHT_RAIL_ITEM_TYPE.NOT_IMAGE_FILES,
    item: FileItem,
    subheader: 'item.fileListSubheader',
    empty: {
      text: 'item.noFilesSharedYet',
      content: 'item.noFileSubText',
      image: FilesEmptyImage,
    },
    sort: {
      sortKey: ITEM_SORT_KEYS.LATEST_VERSION_DATE,
      desc: true,
    },
    automationID: 'files',
    offlinePrompt: 'item.networkErrorFilesPrompt',
  },
  {
    title: 'item.images',
    type: RIGHT_RAIL_ITEM_TYPE.IMAGE_FILES,
    item: ImageItem,
    subheader: 'item.imageListSubheader',
    empty: {
      text: 'item.noImagesSharedYet',
      content: 'item.noImageSubText',
      image: ImagesEmptyImage,
    },
    sort: {
      sortKey: ITEM_SORT_KEYS.LATEST_VERSION_DATE,
      desc: true,
    },
    automationID: 'images',
    offlinePrompt: 'item.networkErrorImagesPrompt',
  },
  {
    title: 'item.tasks',
    type: RIGHT_RAIL_ITEM_TYPE.TASKS,
    item: TaskItem,
    subheader: 'item.taskListSubheader',
    empty: {
      text: 'item.noTasksYet',
      content: 'item.noTaskSubText',
      image: TasksEmptyImage,
    },
    automationID: 'tasks',
    offlinePrompt: 'item.networkErrorTasksPrompt',
  },
  {
    title: 'item.links',
    type: RIGHT_RAIL_ITEM_TYPE.LINKS,
    item: LinkItem,
    subheader: 'item.linkListSubheader',
    empty: {
      text: 'item.noLinksSharedYet',
      content: 'item.noLinkSubText',
      image: LinksEmptyImage,
    },
    sort: {
      desc: true,
    },
    automationID: 'links',
    offlinePrompt: 'item.networkErrorLinksPrompt',
  },
  {
    title: 'item.notes',
    type: RIGHT_RAIL_ITEM_TYPE.NOTES,
    item: NoteItem,
    subheader: 'item.noteListSubheader',
    empty: {
      text: 'item.noNotesCreatedYet',
      content: 'item.noNoteSubText',
      image: NotesEmptyImage,
    },
    sort: {
      desc: true,
    },
    automationID: 'notes',
    offlinePrompt: 'item.networkErrorNotesPrompt',
  },
  {
    title: 'item.events',
    type: RIGHT_RAIL_ITEM_TYPE.EVENTS,
    sort: {
      sortKey: ITEM_SORT_KEYS.START_TIME,
    },
    item: EventItem,
    subheader: 'item.eventListSubheader',
    empty: {
      text: 'item.noEventsCreatedYet',
      content: 'item.noEventSubText',
      image: EventsEmptyImage,
    },
    automationID: 'events',
    offlinePrompt: 'item.networkErrorEventsPrompt',
  },
  {
    title: 'item.integrations',
    type: RIGHT_RAIL_ITEM_TYPE.INTEGRATIONS,
    item: FileItem,
    subheader: '',
    empty: {
      text: 'item.noIntegrationInstallationYet',
      content: 'item.noIntegrationSubText',
      image: IntegrationsEmptyImage,
    },
    automationID: 'integrations',
    offlinePrompt: 'item.networkErrorIntegrationsPrompt',
  },
];

export { TAB_CONFIG, TabConfig, EmptyConfig };
