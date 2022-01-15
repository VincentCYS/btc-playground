import React, { useEffect, useState } from "react";
import "core-js/stable";
import "regenerator-runtime/runtime";
import { useSelector, useDispatch } from "react-redux";
import { Box, Tab, Tabs, Paper, Typography } from "@material-ui/core";

import PropTypes from "prop-types";
import { setBtc } from "./features/btcSlice";
import BtcPlugin from "./plugin/btc_plugin";

let bip39 = require("bip39");

import MnemoicGenerator from "./components/mnemonicGenerator";
import AddressGenerator from "./components/addressGenerator";
import MultisigAddress from "./components/multisigAddress";

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
  const [value, setValue] = useState(2);

  function generateMnemonic() {
    let mnemonic = bip39.generateMnemonic(btc.entropy);
    dispatch(setBtc({ type: "setMnemonic", payload: mnemonic }));

    BtcPlugin.mnemonicToSeed(mnemonic)
      .then((seed) => {
        dispatch(setBtc({ type: "setSeed", payload: seed }));
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
      <Typography
        style={{ color: "#10AFAE", textAlign: "center", marginTop: 50 }}
        variant="body1"
      >
        BTC Playground
      </Typography>
      <Paper
        elevation={3}
        style={{
          borderRadius: 35,
          marginTop: "2vh",
          marginLeft: "5vw",
          marginRight: "5vw",
          padding: "1rem",
          textAlign: "center",
          alignSelf: "center",
          maxWidth: 500,
          backgroundColor: "#191b1f",
        }}
      >
        <Box
          style={{
            borderBottom: 1,
            borderColor: "divider",
            backgroundColor: "#191b1f",
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
            TabIndicatorProps={{ style: { background: "#10AFAE" } }}
          >
            <Tab
              label="Mnemonic"
              {...a11yProps(0)}
              style={{ color: "#fff", fontSize: 12 }}
            />
            <Tab
              label="Address"
              {...a11yProps(1)}
              style={{ color: "#fff", fontSize: 12 }}
            />
            <Tab
              label="Multi-sig Address"
              {...a11yProps(2)}
              style={{ color: "#fff", fontSize: 12 }}
            />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <MnemoicGenerator />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <AddressGenerator />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <MultisigAddress />
        </TabPanel>
      </Paper>
    </div>
  );
}

export default App;
