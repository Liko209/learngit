import { RuiTooltipProps } from 'rcui/components/Tooltip';

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
  disabled: boolean;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  renderValue?: (i: string) => React.ReactNode;
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

export type CallerIdViewProps = {
  tooltipProps: Pick<
  RuiTooltipProps,
  Exclude<keyof RuiTooltipProps, 'children' | 'title'>
  >;
  callerIdProps: CallerIdSelectorProps;
};

export type CallerIdProps = {};
