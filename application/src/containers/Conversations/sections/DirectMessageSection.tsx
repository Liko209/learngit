/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-21 14:29:47
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import {
  ConversationListSection,
  ConversationList,
  ConversationListItem,
  Icon,
} from 'ui-components';
import { observer } from 'mobx-react';
import DirectMessagePresenter from '@/containers/Conversations/sections/DirectMessagePresenter';
import { observable, autorun } from 'mobx';
import storeManager, { ENTITY_NAME } from '@/store';
import GroupModel from '@/store/models/Group';
import PersonModel from '@/store/models/Person';
import PresenceModel from '@/store/models/Presence';

type IProps = {};

@observer
class DirectMessageSection extends React.Component<IProps, {}> {
  directMessagePresenter: DirectMessagePresenter;
  @observable
  ids: number[] = [];
  constructor(props: IProps) {
    super(props);
    this.directMessagePresenter = new DirectMessagePresenter();
    const listStore = this.directMessagePresenter.getStore();
    autorun(() => {
      this.ids = listStore.getIds();
    });
  }

  async componentDidMount() {
    await this.directMessagePresenter.fetchData();
  }

  renderItem(group: GroupModel, index: number) {
    const { members: memberIds } = group;
    const otherMemberIds = memberIds.filter(id =>
      id !== this.directMessagePresenter.getCurrentUserId());
    const personStore = storeManager.getEntityMapStore(ENTITY_NAME.PERSON);
    const members: PersonModel[] = otherMemberIds.map(id => personStore.get(id));
    const toTitleCase = (txt: string) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    const comparator = (a: string, b: string) =>
      (/[a-zA-Z]/.test(a) && !/[a-zA-Z]/.test(b)) ||
        (/0-9/.test(a) && /[^a-zA-Z0-9]/.test(b)) ? -1 :
        a.toLowerCase().localeCompare(b.toLowerCase());

    let title: string | undefined;
    let presence: PresenceModel | undefined;
    if (members.length === 1) {
      // 1 other member, 1:1 conversation
      const { firstName, lastName, email, id } = members[0];
      title =
        firstName && lastName ? `${toTitleCase(firstName)} ${toTitleCase(lastName)}` :
          firstName ? toTitleCase(firstName) :
            lastName ? toTitleCase(lastName) : email;
      const presenceStore = storeManager.getEntityMapStore(ENTITY_NAME.PRESENCE);
      presence = presenceStore.get(id);
      console.log('pre', presence.presence);
    } else if (members.length > 1) {
      // more than one members, group conversation
      const names: string[] = [];
      const emails: string[] = [];
      members.forEach(({ firstName, lastName, email }) => {
        if (!firstName && !lastName) {
          emails.push(email);
        } else if (firstName) {
          names.push(toTitleCase(firstName));
        } else if (lastName) {
          names.push(toTitleCase(lastName));
        }
      });
      title = names.sort(comparator).concat(emails.sort(comparator)).join(', ');
    }

    return (
      <ConversationListItem
        key={index}
        status={presence ? presence.presence : ''}
        title={title || ''}
      />
    );
  }

  render() {
    const groupStore = storeManager.getEntityMapStore(ENTITY_NAME.GROUP);
    return (
      <ConversationListSection
        title="Direct Messages"
        icon={<Icon>textsms</Icon>}
      >
        <ConversationList>
          {this.ids.map((id: number, index: number) => {
            const group = groupStore.get(id);
            if (group) {
              return this.renderItem(group, index);
            }
            return null;
          })}
        </ConversationList>
      </ConversationListSection>
    );
  }
}

export { DirectMessageSection };
export default DirectMessageSection;
