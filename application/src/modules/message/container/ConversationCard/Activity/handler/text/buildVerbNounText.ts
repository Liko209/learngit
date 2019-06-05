import { generateLocalizationKey } from './generateLocalizationKey';

type Parameter = {
  verb: string;
  noun: string;
};

export default ({ verb, noun }: Parameter) => {
  const parameter = {
    verb,
    noun,
  };

  return {
    parameter,
    key: generateLocalizationKey('verb-noun', parameter),
  };
};
