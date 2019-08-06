enum FORM_ITEM_TYPE {
  TOGGLE,
  SELECT,
  VIRTUALIZED_SELECT,
}

type DataTracking = {
  eventName: string;
  type: string;
  name?: string;
  optionTransform?: (value: any) => string;
};

type FormItem = {
  /**
   * The unique id
   */
  id: string | number;

  /**
   * automationId for E2E
   */
  automationId: string;

  /**
   * The i18n key of title
   */
  title?: string;

  /**
   * The i18n key of description
   */
  description?: string;

  /**
   * The component type or component used for render this item
   */
  type: FORM_ITEM_TYPE;

  /**
   * Data Tracking parameters
   */
  dataTracking?: DataTracking;
};

type SelectFormItem<T> = FormItem & {
  type: FORM_ITEM_TYPE.SELECT | FORM_ITEM_TYPE.VIRTUALIZED_SELECT;
  /**
   * Will be called before the Setting Save
   */
  beforeSaving?: (settingValue: any) => Promise<boolean> | boolean | void;
  valueSetter?: (value: T | undefined) => Promise<void> | void;
  valueExtractor: ((value?: T | undefined) => string) | undefined;
  /**
   * Decide how the select renders value
   */
  valueRenderer?: (args: { value: T; source?: T[] }) => React.ReactNode;
  /**
   * Decide how the select renders source
   */
  sourceRenderer?: (args: { value: T; source?: T[] }) => React.ReactNode;
  /**
   * Secondary action Renderer
   */
  secondaryActionRenderer?: (args: {
    value: T;
    source?: T[];
  }) => React.ReactNode;
};

export { FORM_ITEM_TYPE, DataTracking, SelectFormItem };
