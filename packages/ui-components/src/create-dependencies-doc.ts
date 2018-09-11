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
      return `+ ${options ? options.name : __docgenInfo ? __docgenInfo.displayName : displayName} `; // tslint:disable-line
    }).join('\n    ')}
  `;
}

export default createDependenciesDoc;
