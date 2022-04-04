import { FC } from 'react';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { BrowserRouter } from "react-router-dom";
import { Provider } from 'react-redux';
import store from './store';
import Routes from './Routes';

import './App.css';

const App: FC = () => {
  return (
    <MantineProvider theme={{ colorScheme: 'dark', fontFamily: 'Open Sans' }}>
      <ModalsProvider>
        <Provider store={store}>
          <BrowserRouter>
            <Routes />
          </BrowserRouter>
        </Provider>
      </ModalsProvider>
    </MantineProvider>
  );
}

export default App;
