import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import ScrollToTop from './utils/ScrollToTop.jsx';
import store from '../store/index.js';

export default function AppShell({ children }) {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ScrollToTop />
        {children}
      </BrowserRouter>
    </Provider>
  );
}
