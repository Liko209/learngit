import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { UserConfigService } from 'sdk/module/config/service/UserConfigService';
import { uglifiedAlphabet, increasePercent, extraPseudoWords } from './utils';

type PseudoOptionsProps = {
  enabled: boolean;
  languageToPseudo: string;
};

export default class Pseudo {
  name: string;
  type: string;
  pseudoString: string;
  options: PseudoOptionsProps;
  holders: { [key: string]: string };

  constructor({ languageToPseudo = 'en' } = {}) {
    const userConfig = ServiceLoader.getInstance<UserConfigService>(
      ServiceConfig.GLOBAL_CONFIG_SERVICE,
    );
    const enabled = userConfig.get('i18n', 'pseudo');
    this.name = 'pseudo';
    this.type = 'postProcessor';
    this.options = {
      enabled,
      languageToPseudo,
    };
    userConfig.put('i18n', 'pseudo', this.options.enabled);
  }

  increaseStringLength() {
    const dest = this.pseudoString;
    const extraLen = Math.ceil(dest.length * increasePercent);
    return (dest + extraPseudoWords.substr(0, extraLen)).trimRight();
  }

  reservePlaceHolders(options: { [key: string]: string }) {
    let dest = this.pseudoString;
    Object.keys(options).forEach((oKey: string, index: number) => {
      if (!['lng', 'lngs', 'ns'].includes(oKey)) {
        const oVal = options[oKey];
        const hKey = `ṵͼṛα-${index}`;
        dest = dest.replace(oVal, hKey);
        this.holders[hKey] = oVal;
      }
    });
    this.pseudoString = dest;
    return this;
  }

  pseudoWithCharMap() {
    this.pseudoString = this.pseudoString
      .split('')
      .map((letter: string) => uglifiedAlphabet[letter] || letter)
      .join('');
    return this;
  }

  revertPlaceHolders() {
    let dest = this.pseudoString;
    Object.keys(this.holders).forEach((hKey: string) => {
      const hVal = this.holders[hKey];
      dest = dest.replace(hKey, hVal);
    });
    this.pseudoString = dest;
    return this;
  }

  /*
   * Post Processors are used to extend or manipulate the translated values
   * before returning them in t function.
   */
  process(src: string, key: string, options: any, translator: any) {
    if (
      (translator.language && this.options.languageToPseudo !== translator.language) ||
      !this.options.enabled
    ) {
      return src;
    }
    this.holders = {};
    this.pseudoString = src;

    return this.reservePlaceHolders(options)
      .pseudoWithCharMap()
      .revertPlaceHolders()
      .increaseStringLength();
  }
}
