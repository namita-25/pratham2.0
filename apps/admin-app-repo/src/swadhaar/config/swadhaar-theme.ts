import { experimental_extendTheme as extendTheme } from '@mui/material/styles';

const swadhaarTheme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#1A237E',      // Dark Navy Blue
          light: '#534FBD',
          dark: '#000051',
          contrastText: '#FFFFFF',
        },
        secondary: {
          main: '#FF8F00',      // Amber Gold / Sun Gold
          light: '#FFA040',
          dark: '#C56000',
          contrastText: '#FFFFFF',
          '100': '#F3F5F8',
          '200': '#FFFFFF',
          '300': '#EEEEEE',
          '400': '#ddd',
        },
        success: {
          main: '#1A8825',
          light: '#C0FFC7',
          contrastText: '#FFFFFF',
        },
        info: {
          main: '#0D599E',
          light: '#D6EEFF',
          contrastText: '#EFC570',
        },
        warning: {
          '100': '#17130B',
          '200': '#261900',
          '300': '#1F1B13',
          '400': '#7C766F',
          '500': '#969088',
          '600': '#B1AAA2',
          '700': '#DED8E1',
          '800': '#F8EFE7',
          '900': '#DADADA',
          A100: '#D0C5B4',
          A200: '#4d4639',
          A400: '#FFFFFF',
          A700: '#EDEDED',
          contrastText: '#3B383E',
        },
        error: {
          main: '#BA1A1A',
          light: '#FFDAD6',
        },
        action: {
          activeChannel: '#1A237E',
          selectedChannel: '#534FBD',
        },
        Skeleton: {
          bg: '#FFDCC2',
        },
        background: {},
      },
    },
    dark: {
      palette: {
        primary: {
          main: '#1A237E',
          light: '#534FBD',
        },
        secondary: {
          main: '#FF8F00',
          light: '#FFA040',
        },
        success: {
          main: '#1A8825',
          light: '#C0FFC7',
        },
        info: {
          main: '#0D599E',
          light: '#D6EEFF',
        },
        warning: {
          '100': '#17130B',
          '200': '#261900',
          '300': '#1F1B13',
          '400': '#7C766F',
          '500': '#969088',
          '600': '#B1AAA2',
          '700': '#DED8E1',
          '800': '#F8EFE7',
          '900': '#DADADA',
          A100: '#D0C5B4',
          A200: '#4d4639',
          A400: '#FFFFFF',
          A700: '#EDEDED',
        },
        error: {
          main: '#BA1A1A',
          light: '#FFDAD6',
        },
        action: {
          activeChannel: '#1A237E',
          selectedChannel: '#534FBD',
        },
      },
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '100px',
          border: '1px solid #1A237E',
          color: '#1A237E',
          padding: '8px 22px',
          fontWeight: 600,
        },
        containedPrimary: {
          backgroundColor: '#1A237E',
          color: '#FFFFFF',
          border: 'none',
          '&:hover': {
            backgroundColor: '#000051',
          },
        },
        outlinedPrimary: {
          backgroundColor: 'transparent',
          border: '1px solid #1A237E',
          color: '#1A237E',
          '&:hover': {
            backgroundColor: 'rgba(26, 35, 126, 0.04)',
          },
        },
        textPrimary: {
          backgroundColor: 'transparent',
          border: 'none',
          color: '#1A237E',
          '&:hover': {
            backgroundColor: 'rgba(26, 35, 126, 0.04)',
          },
        },
        containedSecondary: {
          backgroundColor: '#FF8F00',
          color: '#FFFFFF',
          border: 'none',
          '&:hover': {
            backgroundColor: '#C56000',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          width: '100%',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '16px',
          width: '90vw',
          maxWidth: '340px',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          '&.Mui-focused': {
            color: '#1A237E',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1A237E',
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          '&.Mui-checked': {
            color: '#1A237E',
          },
        },
      },
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Arial', sans-serif",
    h1: {
      fontSize: '24px',
      fontWeight: 700,
      lineHeight: '32px',
      marginBottom: '1rem',
      color: '#1A237E',
    },
    h2: {
      fontSize: '18px',
      fontWeight: 600,
      lineHeight: '26px',
    },
    h3: {
      fontSize: '16px',
      fontWeight: 600,
      lineHeight: '22px',
      marginBottom: '0.5rem',
    },
    body1: {
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: '24px',
      letterSpacing: '0.5px',
    },
    body2: {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: '20px',
      letterSpacing: '0.25px',
      marginBottom: '1rem',
    },
    button: {
      textTransform: 'none',
      fontSize: '14px',
      fontWeight: 600,
    },
  },
});

export default swadhaarTheme;
