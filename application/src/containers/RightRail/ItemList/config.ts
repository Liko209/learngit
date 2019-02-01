/*
 * @Author: isaac.liu
 * @Date: 2019-01-11 15:30:28
 * Copyright © RingCentral. All rights reserved.
 */
import { ComponentType } from 'react';
import { PinnedItem } from '../PinnedItem';
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

const ITEM_HEIGHT = 52;

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
  offlinePrompt: string;
};

const TAB_CONFIG: TabConfig[] = [
  {
    title: 'pinned',
    type: RIGHT_RAIL_ITEM_TYPE.PIN_POSTS,
    item: PinnedItem,
    subheader: '',
    empty: {
      text: 'youHaveNothingPinnedYet',
      content: 'noPinSubText',
      image: PinnedEmptyImage,
    },
    offlinePrompt: 'networkErrorPinnedPrompt',
  },
  {
    title: 'files',
    type: RIGHT_RAIL_ITEM_TYPE.NOT_IMAGE_FILES,
    item: FileItem,
    subheader: 'fileListSubheader',
    empty: {
      text: 'noFilesSharedYet',
      content: 'noFileSubText',
      image: FilesEmptyImage,
    },
    sort: {
      desc: true,
    },
    offlinePrompt: 'networkErrorFilesPrompt',
  },
  {
    title: 'images',
    type: RIGHT_RAIL_ITEM_TYPE.IMAGE_FILES,
    item: ImageItem,
    subheader: 'imageListSubheader',
    empty: {
      text: 'noImagesSharedYet',
      content: 'noImageSubText',
      image: ImagesEmptyImage,
    },
    sort: {
      desc: true,
    },
    offlinePrompt: 'networkErrorImagesPrompt',
  },
  {
    title: 'tasks',
    type: RIGHT_RAIL_ITEM_TYPE.TASKS,
    item: TaskItem,
    subheader: 'taskListSubheader',
    empty: {
      text: 'noTasksYet',
      content: 'noTaskSubText',
      image: TasksEmptyImage,
    },
    offlinePrompt: 'networkErrorTasksPrompt',
  },
  {
    title: 'links',
    type: RIGHT_RAIL_ITEM_TYPE.LINKS,
    item: LinkItem,
    subheader: 'linkListSubheader',
    empty: {
      text: 'noLinksSharedYet',
      content: 'noLinkSubText',
      image: LinksEmptyImage,
    },
    sort: {
      desc: true,
    },
    offlinePrompt: 'networkErrorLinksPrompt',
  },
  {
    title: 'notes',
    type: RIGHT_RAIL_ITEM_TYPE.NOTES,
    item: NoteItem,
    subheader: 'noteListSubheader',
    empty: {
      text: 'noNotesCreatedYet',
      content: 'noNoteSubText',
      image: NotesEmptyImage,
    },
    sort: {
      desc: true,
    },
    offlinePrompt: 'networkErrorNotesPrompt',
  },
  {
    title: 'events',
    type: RIGHT_RAIL_ITEM_TYPE.EVENTS,
    sort: {
      sortKey: ITEM_SORT_KEYS.START_TIME,
    },
    item: EventItem,
    subheader: 'eventListSubheader',
    empty: {
      text: 'noEventsCreatedYet',
      content: 'noEventSubText',
      image: EventsEmptyImage,
    },
    offlinePrompt: 'networkErrorEventsPrompt',
  },
  {
    title: 'integrations',
    type: RIGHT_RAIL_ITEM_TYPE.INTEGRATIONS,
    item: FileItem,
    subheader: '',
    empty: {
      text: 'noIntegrationInstallationYet',
      content: 'noIntegrationSubText',
      image: IntegrationsEmptyImage,
    },
    offlinePrompt: 'networkErrorIntegrationsPrompt',
  },
];

export { TAB_CONFIG, TabConfig, EmptyConfig, ITEM_HEIGHT };
