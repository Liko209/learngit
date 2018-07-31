const theme = {
  primary: {
    // light: will be calculated from palette.primary.main,
    main: '#ff4400',
    // dark: will be calculated from palette.primary.main,
    // contrastText: will be calculated to contast with palette.primary.main
  },
  secondary: {
    light: '#0066ff',
    main: '#0044ff',
    // dark: will be calculated from palette.secondary.main,
    contrastText: '#ffcc00',
  },
  typography: {
    // Use the system font instead of the default Roboto font.
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    // In Japanese the characters are usually larger.
    fontSize: 12,
    // Tell Material-UI what's the font-size on the html element is.
    htmlFontSize: 10,
  },
};

export default theme;
