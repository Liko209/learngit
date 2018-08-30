type Option = { equal: Function } | null;
function strictDiff(subjects: object[]) {
  return diff(null, subjects);
}

function diff(opts: Option, subjects: object[]) {
  const length = subjects.length;
  const ref = subjects[0];
  let diff = {};
  const equal = (opts && opts.equal) || isStrictEqual;

  for (let i = 1; i < length; i += 1) {
    const c = subjects[i];
    const keys = Object.keys(c);
    const keysLength = keys.length;

    for (let u = 0; u < keysLength; u += 1) {
      const key = keys[u];
      if (!equal(c[key], ref[key])) diff[key] = c[key];
    }
  }
  if (length === 2) {
    diff = {
      ...diff,
      ...Object.keys(ref)
        .filter(key => !new Set(Object.keys(ref)).has(key))
        .map(i => ({ [i]: null })),
    };
  }
  return diff;
}

function isStrictEqual(a: any, b: any) {
  return a === b;
}

export { diff, strictDiff };
