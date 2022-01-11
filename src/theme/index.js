import { createTheme } from "@material-ui/core";

const MuiTheme = createTheme({
  palette: {
    // mode: "dark",

    background: {
      // paper: "#fff",
      // default: "#fff",
    },
    text: {
      primary: "#fff",
      secondary: "#fff",
    },
    textColor: "#fff",
    color: "#000",
    primary: {
      main: "#10AFAE",
      contrastText: "#fff", //button text white instead of black
    },
    secondary: {
      main: "#0B1756",
      contrastText: "#fff", //button text white instead of black
    },
  },
  overrides: {
    MuiSelect: {
      select: {
        "&:before": {
          borderColor: "white",
        },
        "&:after": {
          borderColor: "white",
        },
        "&:not(.Mui-disabled):hover::before": {
          borderColor: "white",
        },
      },
      icon: {
        fill: "white",
      },
      root: {
        color: "white",
      },
    },
    MuiInput: {
      input: {
        "&::placeholder": {
          color: "#fff",
        },
        color: "#fff", // if you also want to change the color of the input, this is the prop you'd use
      },
    },
    MuiListItem: {
      root: {
        color: "#000",
      },
    },
    MuiOutlinedInput: {
      root: {
        position: "relative",
        "& $notchedOutline": {
          borderColor: "#fff",
        },
      },
    },
    MuiButton: {
      "& $notchedOutline": {
        borderColor: "#fff",
      },
    },
  },
});

export default MuiTheme;
