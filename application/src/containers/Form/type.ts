enum FORM_ITEM_TYPE {
  TOGGLE,
  SELECT,
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
   * The i18n key of label
   */
  label?: string;

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
  type: FORM_ITEM_TYPE.SELECT;
  /**
   * Decide how the select renders value
   */
  valueRenderer?: (args: { value: T; source?: T[] }) => React.ReactNode;
  /**
   * Decide how the select renders source
   */
  sourceRenderer?: (args: { value: T; source?: T[] }) => React.ReactNode;
};
