import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setMnemonic, setSeed } from "./features/counter/btcSlice";
import BtcPlugin from "./plugin/btc_plugin";
let bip39 = require("bip39");

import MnemoicGenerator from "./components/mnemonicGenerator";
import AddressGenerator from "./components/addressGenerator";

function App() {
  const dispatch = useDispatch();
  const btc = useSelector((state) => state.btc);

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
    console.log("online");
    if (btc.mnemonic != "") {
      generateMnemonic();
    }
  });

  // Re-generate mnemonic if network is changed
  window.addEventListener("offline", function (e) {
    console.log("offline");
    if (btc.mnemonic != "") {
      generateMnemonic();
    }
  });

  return (
    <div>
      <h2
        className="card-title"
        style={{
          marginTop: "3rem",
          textAlign: "center",
          fontFamily: "monospace",
        }}
      >
        BTC Playground
      </h2>

      <MnemoicGenerator />
      <AddressGenerator />
    </div>
  );
}

export default App;
