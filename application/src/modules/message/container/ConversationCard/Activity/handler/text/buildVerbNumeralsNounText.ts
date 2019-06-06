import { generateLocalizationKey } from './generateLocalizationKey';

type Parameter = {
  verb: string;
  numerals: number;
  noun: string;
};

export default ({ verb, numerals, noun }: Parameter) => {
  const parameter = {
    verb,
    noun,
    count: numerals,
  };

  return {
    parameter,
    key: generateLocalizationKey('verb-numerals-noun', parameter),
  };
};
