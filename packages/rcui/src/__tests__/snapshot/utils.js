export function isExcluded(kind, name, config) {
  if (
    config.name.includes(name) ||
    config.kind.includes(kind) ||
    (config.matchFunction && config.matchFunction({ kind, name }))
  ) {
    return true;
  }
}
