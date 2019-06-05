import { generateLocalizationKey } from './generateLocalizationKey';

type Parameter = {
  verb: string;
  noun: string;
  user: string;
};

export default ({ verb, noun, user }: Parameter) => {
  const parameter = {
    verb,
    noun,
    user,
  };

  return {
    parameter,
    key: generateLocalizationKey('verb-noun-user', parameter),
  };
};
