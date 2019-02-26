import { NewGlobalConfig } from './NewGlobalConfig';

function handleLogout() {
  // When logout, ConfigDao was cleared, but we don't want to loose
  // env config. So we save env to sessionStorage, when logout we
  // get the env from sessionStorage and put it back to ConfigDao
  const env = sessionStorage.getItem('env');
  if (!env) return;
  NewGlobalConfig.setEnv(env);
}

export { handleLogout };
