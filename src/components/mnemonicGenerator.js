import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setWordCount,
  setMnemonic,
  setSeed,
} from "../features/counter/btcSlice";
import {
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Container,
  Tooltip,
  Paper,
  ThemeProvider,
} from "@material-ui/core";
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

  const btc = useSelector((state) => state.btc);
  const dispatch = useDispatch();

  async function copyToClipboard(text) {
    await navigator.clipboard.writeText(text);
    setTooltipText("Copied!");
  }

  function generateMnemonic() {
    let mnemonic = bip39.generateMnemonic(btc.entropy);
    dispatch(setMnemonic(mnemonic));

    BtcPlugin.mnemonicToSeed(mnemonic)
      .then((bytes) => bytes.toString("hex"))
      .then((seed) => {
        dispatch(setSeed(seed));
      })
      .catch((err) => console.log(err));
  }

  return (
    <ThemeProvider theme={MuiTheme}>
      <Paper
        elevation={3}
        style={{
          marginTop: "2rem",
          marginRight: "10vw",
          marginLeft: "10vw",

          padding: "2rem",
          textAlign: "center",
          // backgroundColor: "#0f0f0f",
        }}
      >
        <h2
          className="card-title"
          style={{ fontFamily: "monospace", color: "white" }}
        >
          Generate mnemonic
        </h2>
        <Box sx={{ minWidth: 120 }}>
          <FormControl className={classes.formControl} fullWidth>
            <InputLabel id="demo-simple-select-label">
              Select Raw Entropy Words
            </InputLabel>
            <Select
              labelId="select-label"
              id="select"
              value={btc.wordCount}
              onChange={(e) => {
                dispatch(setWordCount(e.target.value));
              }}
            >
              <MenuItem value={12}>12</MenuItem>
              <MenuItem value={15}>15</MenuItem>
              <MenuItem value={18}>18</MenuItem>
              <MenuItem value={21}>21</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Container>
          <Tooltip
            title={tooltipText}
            aria-label={tooltipText}
            arrow
            onClose={() =>
              setTimeout(() => setTooltipText("Copy to clipboard"), 300)
            }
          >
            <Button
              variant="outlined"
              disabled={btc.mnemonic == ""}
              style={{
                height: "5rem",
                width: "90%",
                textTransform: "none",
                marginTop: "3rem",
                marginBottom: "3rem",
                borderColor: "#10AFAE",
              }}
              onClick={() => copyToClipboard(btc.mnemonic)}
            >
              {btc.mnemonic ? btc.mnemonic : "Wallet Mnemonic"}
            </Button>
          </Tooltip>
        </Container>
        <Container>
          <Tooltip
            title={tooltipText}
            aria-label={tooltipText}
            arrow
            onClose={() =>
              setTimeout(() => setTooltipText("Copy to clipboard"), 300)
            }
          >
            <Button
              variant="outlined"
              disabled={btc.seed == ""}
              style={{
                height: "5rem",
                width: "90%",
                textTransform: "none",
                marginTop: "3rem",
                marginBottom: "3rem",
                borderColor: "#10AFAE",
                wordBreak: "break-all",
              }}
              onClick={() => copyToClipboard(btc.seed)}
            >
              {btc.seed ? btc.seed : "Wallet seed"}
            </Button>
          </Tooltip>
        </Container>

        <Button
          variant="contained"
          style={{ backgroundColor: "#10AFAE" }}
          onClick={() => dispatch(generateMnemonic())}
        >
          Generate
        </Button>
      </Paper>
    </ThemeProvider>
  );
}

export default MnemoicGenerator;
