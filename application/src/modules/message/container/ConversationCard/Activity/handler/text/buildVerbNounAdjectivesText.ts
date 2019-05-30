import { generateLocalizationKey } from './generateLocalizationKey';

type Parameter = {
  verb: string;
  adjective: string;
  noun: string;
};

export default ({ verb, adjective, noun }: Parameter) => {
  const parameter = {
    verb,
    noun,
    adjective,
  };

  return {
    parameter,
    key: generateLocalizationKey('verb-noun-adjective', parameter),
  };
};
