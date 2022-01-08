import { createMuiTheme } from "@material-ui/core";

const MuiTheme = createMuiTheme({
  palette: {
    background: {
      paper: "#fff",
      default: "#fff",
    },
    text: {
      default: "#000",
    },
    textColor: "#000",
    color: "#000",
    primary: {
      main: "#10AFAE",
      contrastText: "#10AFAE", //button text white instead of black
    },
    secondary: {
      main: "#000",
      contrastText: "#fff", //button text white instead of black
    },
  },
});

export default MuiTheme;
