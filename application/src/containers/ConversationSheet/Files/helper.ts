function getFileSize(bytes: number) {
  if (bytes / 1024 < 1000) {
    return `${(bytes / 1024).toFixed(1)}Kb`;
  }
  if (bytes / 1024 / 1024 < 1000) {
    return `${(bytes / 1024 / 1024).toFixed(1)}Mb`;
  }
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)}Gb`;
}

export { getFileSize };
