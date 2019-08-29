export function isObjectSourceItem(
  value: any,
): value is {
  id: number | string;
} {
  return value && value.id !== undefined;
}

export function extractValue<T>(
  sourceItem: T,
  valueExtractor?: (value: T) => string,
): string {
  let result: string | number;
  if (valueExtractor) {
    result = valueExtractor(sourceItem);
  } else if (typeof sourceItem === 'string' || typeof sourceItem === 'number') {
    result = sourceItem;
  } else if (isObjectSourceItem(sourceItem)) {
    result = sourceItem.id;
  } else if (sourceItem === undefined) {
    result = '';
  } else {
    throw new Error('Error: Can not extract value of source');
  }
  return result.toString();
}
