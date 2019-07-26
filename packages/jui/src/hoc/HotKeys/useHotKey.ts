import { useCallback, useEffect } from 'react';

type CallbackFn = (
  e: KeyboardEvent,
  combo: string,
) => (void | boolean) | Promise<void | boolean>;
type HotKeyConfig = {
  key: string;
  callback: CallbackFn;
  // el?: HTMLElement;
};
export function useHotKey({ key, callback }: HotKeyConfig, deps: any[] = []) {
  const memoisedCallback = useCallback(callback, deps);
  useEffect(() => {
    const mouseTrap = new Mousetrap(document.body);
    mouseTrap.bind(key, callback);
    return () => mouseTrap.unbind(key);
  }, [memoisedCallback]);
}
