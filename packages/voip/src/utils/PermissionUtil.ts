export function subscribePermissionChange(
  name: PermissionName,
  cb: (newState: PermissionState, preState: PermissionState) => void,
) {
  if (navigator.permissions) {
    navigator.permissions
      .query({
        name,
      })
      .then(permissionStatus => {
        let lastState = permissionStatus.state;
        permissionStatus.addEventListener('change', () => {
          if (lastState !== permissionStatus.state) {
            const temp = lastState;
            lastState = permissionStatus.state;
            cb(permissionStatus.state, temp);
          }
        });
      });
  }
}
