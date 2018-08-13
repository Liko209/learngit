import React from 'react';
import storeManager from '@/store';
// Make sure the shape of the default value passed to
// createContext matches the shape that the consumers expect!
const StoreContext = React.createContext(storeManager);

export default StoreContext;
