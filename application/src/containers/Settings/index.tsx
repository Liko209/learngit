import React from 'react';
import { i18n } from 'i18next';
import { translate } from 'react-i18next';

interface IProps {
  i18n: i18n;
}
class Settings extends React.Component<IProps> {
  render() {
    const { i18n } = this.props;
    const changeLanguage = (lng: string) => {
      i18n.changeLanguage(lng);
    };
    return (
      <div>
        <button onClick={changeLanguage.bind(this, 'zh')}>zh-cn</button>
        <button onClick={changeLanguage.bind(this, 'en')}>en-us</button>
      </div>
    );
  }
}

export default translate('translations')(Settings);
