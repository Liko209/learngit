import { ComponentType } from 'react';

type IDependency = {
  __docgenInfo?: {
    displayName: string,
  },
  options?: {
    name: string,
  },
  displayName?: string,
} & (ComponentType | ((props: any) => JSX.Element));

function createDependenciesDoc(dependencies: IDependency[]) {
  return `
    #### Dependencies

    ${dependencies.map((dependency) => {
      const { options, __docgenInfo, displayName } = dependency;
      if (options) return `+ ${options.name}`;
      if (__docgenInfo) {
        `+ ${__docgenInfo.displayName}`;
      }
      return `+ ${displayName}`;
    }).join('\n    ')}
  `;
}

export default createDependenciesDoc;
