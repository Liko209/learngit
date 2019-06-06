import curry from 'lodash/curry';

const buildTitleAndDesc = curry(
  (page: string, section: string, item: string) => {
    const common = `setting.${page}.${section}.${item}`;
    return {
      title: `${common}.label`,
      description: `${common}.description`,
    };
  },
);

export { buildTitleAndDesc };
