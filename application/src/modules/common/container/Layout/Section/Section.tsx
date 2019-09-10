/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-21 14:36:40
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';

import history from '@/history';
import { JuiListNavItem, JuiListNavItemText } from 'jui/components/Lists';
import { JuiConversationListSection } from 'jui/pattern/ConversationList';
import { toTitleCase } from '@/utils/string';

import { SectionViewProps } from './types';

type State = { expanded: boolean };
type Props = WithTranslation & SectionViewProps;

@observer
class SectionViewComponent extends Component<Props, State> {
  state = {
    expanded: false,
  };

  private _clickCache: Map<
    string,
    (event: React.MouseEvent<HTMLLIElement, MouseEvent>) => void
  > = new Map();

  private _cacheClick = (path: string) => {
    const fnMap = this._clickCache;
    if (!fnMap.get(path)) {
      fnMap.set(path, () => {
        this._handleClick(path);
      });
    }
    return fnMap.get(path);
  };

  componentDidMount() {
    const { tabs, selectedPath } = this.props;
    const currentPath =
      selectedPath || `/${window.location.pathname.split('/').pop()}`;
    const shouldExpanded = tabs.some(({ path }) => path === currentPath);

    if (shouldExpanded) {
      this.setState({
        expanded: true,
      });
    }
  }

  private _handleClick = (path: string) => {
    const { rootPath, updateCurrentUrl } = this.props;
    history.push(`${rootPath}${path}`);
    updateCurrentUrl(`${rootPath}${path}`);
  };

  private _switchExpanded = () => {
    const { expanded } = this.state;
    this.setState({
      expanded: !expanded,
    });
  };

  private get _navItemClasses() {
    return { selected: 'selected' };
  }

  render() {
    const { expanded } = this.state;
    const { t, tabs, title, selectedPath } = this.props;

    return (
      <JuiConversationListSection
        onCollapse={this._switchExpanded}
        onExpand={this._switchExpanded}
        expanded={expanded}
        title={toTitleCase(t(title)).toUpperCase()}
        data-test-automation-id={`${title}-section`}
      >
        {tabs.map(({ title, path, automationID }) => {
          return (
            <JuiListNavItem
              key={title}
              onClick={this._cacheClick(path)}
              selected={path === selectedPath}
              classes={this._navItemClasses}
              data-test-automation-id={`${automationID}-tab`}
            >
              <JuiListNavItemText>{t(title)}</JuiListNavItemText>
              {/* {UMIType && <ContactUMI type={UMIType} />} */}
            </JuiListNavItem>
          );
        })}
      </JuiConversationListSection>
    );
  }
}

const SectionView = withTranslation('translations')(SectionViewComponent);

export { SectionView };
