import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, GlobalStyles, ThemeProvider } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from './App';
import { appTheme } from './theme/theme';
import { store } from './redux/store';
import { useAuth } from './hooks/useAuth';

function BootstrapAuth({ children }) {
  const { token, user, initialized, refreshMe } = useAuth();

  useEffect(() => {
    if (token && !user && !initialized) {
      refreshMe();
    }
  }, [token, user, initialized, refreshMe]);

  return children;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            body: {
              background: 'linear-gradient(180deg, #0b1020 0%, #111933 100%)',
              minHeight: '100vh'
            },
            '#root': {
              minHeight: '100vh'
            }
          }}
        />
        <BrowserRouter>
          <BootstrapAuth>
            <App />
          </BootstrapAuth>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
