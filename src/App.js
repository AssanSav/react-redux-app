import React from 'react';
import Bugs from './components/Bugs';
import './App.css';
import StoreContext from './components/contexts/storeContext';
import configureStore from './store/configureStore';

const store = configureStore()

function App() {
  return (
    <StoreContext.Provider value={store}>
      <Bugs />
    </StoreContext.Provider>
  );
}

export default App;
