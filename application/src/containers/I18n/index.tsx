import * as React from 'react';
import { translate } from 'react-i18next';
import { TranslationFunction } from 'i18next';
import injectStore, { IStoresProps } from '@/store/inject';
import { ENTITY_NAME } from '@/store';

type IProps = {
  t: TranslationFunction;
} & IStoresProps;
@injectStore()
class I18n extends React.PureComponent<IProps> {
  render() {
    const { t, getEntity } = this.props;
    const post = getEntity(ENTITY_NAME.POST, 1);
    return (
      <div>
        <h2>{t('heading')}</h2>
        <p>{t('description')}</p>
        <p>{t('key1', { what: 'i18next', how: 'great' })}</p>
        <p>{t('key2', { date: new Date() })}</p>
        <p>{t('keyWithCount', { count: 1 })}</p>
        <p>{t('keyWithCount', { count: 100 })}</p>
        <p>store: {JSON.stringify(post)}</p>
      </div>
    );
  }
}

export default translate('i18next')(I18n);
