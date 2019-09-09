import { PermissionName, PermissionState } from './types';

export function subscribePermissionChange(
  name: PermissionName,
  cb: (newState: PermissionState, preState: PermissionState) => void,
) {
  // @ts-ignore
  if (navigator.permissions) {
    // @ts-ignore
    navigator.permissions
      .query({
        name,
      })
      // @ts-ignore
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
