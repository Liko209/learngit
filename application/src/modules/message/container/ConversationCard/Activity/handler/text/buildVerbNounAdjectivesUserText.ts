import { generateLocalizationKey } from './generateLocalizationKey';

type Parameter = {
  verb: string;
  adjective: string;
  noun: string;
  user: string;
};

export default ({ verb, adjective, noun, user }: Parameter) => {
  const parameter = {
    verb,
    noun,
    adjective,
    user,
  };

  return {
    parameter,
    key: generateLocalizationKey('verb-noun-adjective-user', parameter),
  };
};
