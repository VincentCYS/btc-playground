import React, { useEffect, useState } from "react";
import "core-js/stable";
import "regenerator-runtime/runtime";
import { useSelector, useDispatch } from "react-redux";

import PropTypes from "prop-types";
import { setMnemonic, setSeed } from "./features/counter/btcSlice";
import BtcPlugin from "./plugin/btc_plugin";

let bip39 = require("bip39");

import { Box, Tab, Tabs, Paper } from "@material-ui/core";

import MnemoicGenerator from "./components/mnemonicGenerator";
import AddressGenerator from "./components/addressGenerator";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}

function App() {
  const dispatch = useDispatch();
  const btc = useSelector((state) => state.btc);
  const [value, setValue] = useState(1);

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

  // Re-generate mnemonic if network is changed
  window.addEventListener("online", function (e) {
    if (btc.mnemonic != "") {
      generateMnemonic();
    }
  });

  // Re-generate mnemonic if network is changed
  window.addEventListener("offline", function (e) {
    if (btc.mnemonic != "") {
      generateMnemonic();
    }
  });

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        minWidth: "fit-content",
      }}
    >
      <h2
        className="card-title"
        style={{
          marginTop: "2vh",
          textAlign: "center",
          fontFamily: "monospace",
          color: "#fff",
        }}
      >
        BTC Playground
      </h2>

      <Paper
        elevation={3}
        style={{
          borderRadius: 35,
          marginTop: "2vh",
          marginLeft: "5vw",
          marginRight: "5vw",
          padding: "1rem",
          textAlign: "center",
          maxWidth: 500,
          backgroundColor: "#191b1f",
        }}
      >
        <Box
          style={{
            borderBottom: 1,
            borderColor: "divider",
            backgroundColor: "#191b1f",
            maxWidth: "fit-content",
            alignItems: "center",
          }}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
            TabIndicatorProps={{ style: { background: "#10AFAE" } }}
          >
            <Tab label="Mnemoic" {...a11yProps(0)} style={{ color: "#fff" }} />
            <Tab label="Address" {...a11yProps(1)} style={{ color: "#fff" }} />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <MnemoicGenerator />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <AddressGenerator />
        </TabPanel>
      </Paper>
    </div>
  );
}

export default App;
