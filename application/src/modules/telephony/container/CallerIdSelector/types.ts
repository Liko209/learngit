export * from './CallerIdItem/types';

export interface ICallerPhoneNumber {
  phoneNumber: string;
  value: string;
  usageType: string;
  label?: string;
}

export type CallerIdSelectorProps = {
  value: string;
  menu: ICallerPhoneNumber[];
  label: string;
  disabled: boolean;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
};

export type CallerIdSelectorState = {
  focusIndex: number;
  displayStartIdx: number;
  displayEndIdx: number;
};

export enum Direction {
  UP = 'up',
  DOWN = 'down',
}
