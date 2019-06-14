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
    number: numerals,
  };

  return {
    parameter,
    key: generateLocalizationKey('verb-noun-numerals', parameter),
  };
};
