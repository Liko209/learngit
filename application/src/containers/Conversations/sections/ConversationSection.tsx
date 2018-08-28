/*
 * @Author: Andy Hu (andy.hu@ringcentral.com)
 * @Date: 2018-08-22 15:21:35
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { translate } from 'react-i18next';
import { TranslationFunction } from 'i18next';
import { observer } from 'mobx-react';
import {
  ConversationListSection,
  Icon,
  ConversationList,
} from 'ui-components';
import { toTitleCase } from '@/utils';
import ConversationListItemCell from '../ConversationListItemCell';
import { IConversationSectionPresenter } from './IConversationSection';
import DirectMessageListPresenter from './DirectMessageListPresenter';

interface IProps {
  t: TranslationFunction;
  expanded?: boolean;
  presenter: IConversationSectionPresenter;
}

@observer
class ConversationSectionComponent extends React.Component<IProps> {
  static defaultProps = {
    expanded: true,
  };

  componentDidMount() {
    this.props.presenter.fetchData();
  }

  renderList() {
    const { presenter } = this.props;
    const store = presenter.getStore();
    const ids = store.getIds();
    const entityName = presenter.entityName;
    const currentUserId =
      presenter instanceof DirectMessageListPresenter &&
        presenter.getCurrentUserId &&
        presenter.getCurrentUserId() ? presenter.getCurrentUserId() as number : undefined;
    return (
      <ConversationList>
        {ids.map(id => (
          <ConversationListItemCell
            id={id}
            key={id}
            entityName={entityName}
            currentUserId={currentUserId}
          />
        ))}
      </ConversationList>
    );
  }

  render() {
    const { t } = this.props;
    const { title, anchor, iconName } = this.props.presenter;
    return (
      <div data-anchor={anchor}>
        <ConversationListSection
          icon={<Icon>{iconName}</Icon>}
          title={toTitleCase(t(title))}
          expanded={this.props.expanded}
        >
          {this.renderList()}
        </ConversationListSection>
      </div >
    );
  }
}

const ConversationSection = translate('Conversations')(ConversationSectionComponent);
export { ConversationSection };
export default ConversationSection;
