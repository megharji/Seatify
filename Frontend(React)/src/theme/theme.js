import { createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7c9cff'
    },
    secondary: {
      main: '#6ef3c5'
    },
    background: {
      default: '#0b1020',
      paper: 'rgba(17, 25, 51, 0.92)'
    }
  },
  shape: {
    borderRadius: 18
  },
  typography: {
    fontFamily: 'Inter, Arial, sans-serif',
    h3: { fontWeight: 800 },
    h4: { fontWeight: 800 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 700 }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(18px)',
          border: '1px solid rgba(255,255,255,0.08)',
          backgroundImage: 'none'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(17, 25, 51, 0.92)',
          border: '1px solid rgba(255,255,255,0.08)'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          paddingInline: 18
        }
      }
    }
  }
});
