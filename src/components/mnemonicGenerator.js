import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setBtc } from "../features/btcSlice";
import {
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Container,
  Tooltip,
  ThemeProvider,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
} from "@material-ui/core";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import MuiTheme from "../theme/index";
import { makeStyles } from "@material-ui/core/styles";
import BtcPlugin from "../plugin/btc_plugin";

let bip39 = require("bip39");

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 200,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  root: {
    margin: "0.5rem",
    padding: "2rem",
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
}));

function MnemoicGenerator() {
  const classes = useStyles();

  const [tooltipText, setTooltipText] = useState("Copy to clipboard");
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = () => setShowPassword(!showPassword);

  const btc = useSelector((state) => state.btc);
  const dispatch = useDispatch();

  async function copyToClipboard(text) {
    if (text != "") {
      await navigator.clipboard.writeText(text);
      setTooltipText("Copied!");
    }
  }

  function generateMnemonic() {
    let mnemonic = bip39.generateMnemonic(btc.entropy);
    console.log(mnemonic);
    BtcPlugin.mnemonicToSeed(mnemonic)
      .then((seed) => {
        dispatch(setBtc({ type: "setSeed", payload: seed }));
        dispatch(setBtc({ type: "setMnemonic", payload: mnemonic }));
      })
      .catch((err) => {
        alert(err);
      });
  }

  return (
    <ThemeProvider theme={MuiTheme}>
      <Container style={{ display: "flex", flexDirection: "column" }}>
        <Box
          sx={{ minWidth: 120, marginTop: "2rem" }}
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {/*  ============== Mnemonic word count selector ============== */}
          <FormControl
            className={classes.formControl}
            style={{ flex: 1, maxWidth: "3vw" }}
          >
            <InputLabel id="demo-simple-select-label">
              Select word count
            </InputLabel>
            <Select
              labelId="select-label"
              id="select"
              value={btc.wordCount}
              onChange={(e) => {
                dispatch(
                  setBtc({ type: "setWordCount", payload: e.target.value })
                );
                dispatch(setBtc({ type: "setSeed", payload: "" }));
                dispatch(setBtc({ type: "setMnemonic", payload: "" }));
              }}
            >
              <MenuItem value={12}>12</MenuItem>
              <MenuItem value={15}>15</MenuItem>
              <MenuItem value={18}>18</MenuItem>
              <MenuItem value={21}>21</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/*  ============== Show Mnemonic ============== */}
        <Container
          style={{
            display: "flex",
            flexDirection: "column",
            marginBottom: "1rem",
          }}
        >
          <Typography
            style={{
              color: "#10AFAE",
              textAlign: "start",
              marginTop: "3rem",
            }}
            variant="caption"
          >
            Mnemonic
          </Typography>
          <Tooltip
            title={tooltipText}
            aria-label={tooltipText}
            disableHoverListener={btc.mnemonic == ""}
            arrow
            onClose={() =>
              setTimeout(() => setTooltipText("Copy to clipboard"), 300)
            }
          >
            <TextField
              variant="outlined"
              type={showPassword ? "text" : "password"}
              value={btc.mnemonic ? btc.mnemonic : ""}
              style={{
                height: "3vw",
                width: "90%",
                textTransform: "none",
                marginBottom: "3rem",
                borderColor: "#fff",
                color: "#fff",
              }}
              onClick={() => copyToClipboard(btc.mnemonic)}
              // Show/hide wallet mnemonic
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      style={{
                        margin: 1,
                        color: "#fff",
                      }}
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Tooltip>
        </Container>

        {/*  ============== Show seed ============== */}
        <Container style={{ display: "flex", flexDirection: "column" }}>
          <Typography
            style={{
              color: "#10AFAE",
              textAlign: "start",
              justifySelf: "start",
            }}
            variant="caption"
          >
            Seed
          </Typography>
          <Tooltip
            title={tooltipText}
            aria-label={tooltipText}
            disableHoverListener={btc.seed == ""}
            arrow
            onClose={() =>
              setTimeout(() => setTooltipText("Copy to clipboard"), 300)
            }
          >
            <TextField
              variant="outlined"
              type={showPassword ? "text" : "password"}
              value={btc.seed ? btc.seed : ""}
              style={{
                height: "auto",
                width: "90%",
                textTransform: "none",
                marginBottom: "3rem",
                wordBreak: "break-all",
                borderColor: "#fff",
                color: "#fff",
              }}
              onClick={() => copyToClipboard(btc.seed)}
              // Show/hide wallet seed
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      style={{ color: "#fff", margin: 1 }}
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Tooltip>
        </Container>

        <Button
          variant="contained"
          style={{
            backgroundColor: "#10AFAE",
            borderRadius: 25,
            maxWidth: "20rem",
            alignSelf: "center",
          }}
          onClick={() => generateMnemonic()}
        >
          Generate
        </Button>
      </Container>
    </ThemeProvider>
  );
}

export default MnemoicGenerator;
