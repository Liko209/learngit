import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import ThemeSwitcher from '@/containers/ThemeSwitcher';

class Settings extends React.Component<WithTranslation> {
  render() {
    const { i18n } = this.props;
    const changeLanguage = (lng: string) => {
      i18n.changeLanguage(lng);
    };
    return (
      <div>
        <button onClick={changeLanguage.bind(this, 'zh')}>zh-cn</button>
        <button onClick={changeLanguage.bind(this, 'en')}>en-us</button>
        <ThemeSwitcher />
      </div>
    );
  }
}

export default withTranslation('translations')(Settings);
