/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-08-26 14:30:57
 * Copyright © RingCentral. All rights reserved.
 */

type FormattedKey = {
  original: string;
  formatted: string;
};

type FormattedTerms = {
  formattedKeys: FormattedKey[];
  validFormattedKeys: FormattedKey[];
};

type Terms = {
  searchKey?: string;
  searchKeyTerms: string[];
  searchKeyTermsToSoundex: string[];
  searchKeyFormattedTerms: FormattedTerms;
};

export { FormattedKey, FormattedTerms, Terms };
