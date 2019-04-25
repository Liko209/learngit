import * as fs from 'fs';

const METRICS = ['lines', 'functions', 'branches', 'statements'];

const DUMMY_ROW = <IRow>{
  lines: { pct: NaN },
  functions: { pct: NaN },
  branches: { pct: NaN },
  statements: { pct: NaN },
};

interface IReport {
  [key: string]: IRow;
}

interface IRow {
  [key: string]: ICell;
}

interface ICell {
  pct: number;
}

interface IDiff {
  [key: string]: {
    oldRow?: IRow;
    newRow?: IRow;
  };
}

function findMaxPrefix(str1: string, str2: string): string {
  if (!str1 || !str2) {
    return '';
  }

  let prefix = [];
  let length = Math.min(str1.length, str2.length);
  for (let i = 0; i < length; i++) {
    if (str1[i] !== str2[i]) {
      break;
    }
    prefix.push(str1[i]);
  }
  return prefix.join('');
}

function findMaxPrefixFromArray(arr: Array<string>): string {
  if (!arr || arr.length === 0) {
    return '';
  }

  let prefix = arr[0];
  for (let i = 1; i < arr.length; i++) {
    prefix = findMaxPrefix(prefix, arr[i]);
  }
  return prefix;
}

function cleanAbsolutePath(data: any) {
  if (!data) {
    return data;
  }

  const total = data['total'];
  delete data['total'];
  const keys = Object.keys(data);
  const prefix = findMaxPrefixFromArray(keys);
  const result = { total };
  for (let key of keys) {
    result[key.substr(prefix.length)] = data[key];
  }
  return result
}

function loadData(path: string) {
  return cleanAbsolutePath(JSON.parse(fs.readFileSync(path, { encoding: 'utf-8' })));
}

function diff(oldData: IReport, newData: IReport) {
  // create union of two set
  const common = [];
  for (const key in newData) {
    if (oldData[key]) {
      common.push(key);
    }
  }

  const result: IDiff = {};
  // update
  for (const key of common) {
    const oldRow = oldData[key];
    const newRow = newData[key];
    delete oldData[key];
    delete newData[key];
    if (isDiff(oldRow, newRow)) {
      result[key] = { oldRow, newRow };
    }
  }
  // add
  for (const key in newData) {
    result[key] = { newRow: newData[key] };
  }
  // remove
  for (const key in oldData) {
    result[key] = { oldRow: oldData[key] };
  }
  return result;
}

function isDiff(row1: IRow, row2: IRow) {
  for (const key of METRICS) {
    if (row1[key].pct !== row2[key].pct) {
      return true;
    }
  }
  return false;
}

function toCsvReport(diffReport: IDiff) {
  const csv = [];
  csv.push(['file', ...METRICS]);

  for (const key in diffReport) {
    const csvRow = [key.replace(process.cwd(), '.')];
    const diffRow = diffReport[key];
    for (const metric of METRICS) {
      const oldMetric = (diffRow.oldRow || DUMMY_ROW)[metric].pct;
      const newMetric = (diffRow.newRow || DUMMY_ROW)[metric].pct;
      if (oldMetric === newMetric) {
        csvRow.push(`${newMetric}`);
      } else {
        const delta = newMetric - oldMetric;
        csvRow.push(`${newMetric} (${delta > 0 ? '+' : ''}${delta.toFixed(2)})`);
      }
    }
    csv.push(csvRow.join(','));
  }
  return csv.join('\n');
}

// start from here
let baselineFile: string;
let targetFile: string;
const args = [baselineFile, targetFile] = process.argv.slice(2);
if (2 !== args.length) {
  console.error('invalid arguments\n  usage: ts-node report-diff.ts baseline.json target.json');
  process.exit(1);
}

console.log(toCsvReport(diff(loadData(baselineFile), loadData(targetFile))));
