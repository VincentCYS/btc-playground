import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  FormGroup,
  FormControl,
  TextField,
  ThemeProvider,
  IconButton,
  Container,
} from "@material-ui/core";
import BtcPlugin from "../plugin/btc_plugin";
import MuiTheme from "../theme/index";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
var QRCode = require("qrcode.react");

function AddressGenerator() {
  const mnemonic = useSelector((state) => state.btc.mnemonic);
  // const seed = useSelector((state) => state.btc.seed);
  let [address, setAddress] = useState({
    legacyAddress: {
      name: "Legacy Address",
      address: "",
    },
    nestedAddress: {
      name: "Nested Address",
      address: "",
    },
    bech32Address: {
      name: "Bech32 Address",
      address: "",
    },
  });

  let [addressConfig, setAddressConfig] = useState({
    seed: "",
    purpose: 44,
    network: 0,
    account: 0,
    chain: 0,
    index: 0,
    derivePath: "",
  });

  function showAddress() {
    return Object.keys(address).length > 0
      ? Object.keys(address).map((_) => (
          // address[_]
          <Container>
            {/* Legacy address */}
            <p className="card-text" style={{ height: "5rem" }}>
              {address[_].name}: {address[_].address}
            </p>
            {address[_].address ? (
              <div>
                <IconButton
                  onClick={() =>
                    window.open(
                      `https://www.blockchain.com/btc/address/${address[_].address}`
                    )
                  }
                >
                  <OpenInNewIcon />
                </IconButton>

                <QRCode value={address[_].address} />
              </div>
            ) : null}
          </Container>
        ))
      : null;
  }

  useEffect(() => {
    // BtcPlugin.mnemonicToSeed(mnemonic)
    //   .then((seed) => {
    //     setAddressConfig((prevState) => ({ ...prevState, seed }));
    //   })
    //   .catch((err) => console.log(err));

    // // get Legacy address
    BtcPlugin.getLegacyAddress(addressConfig)
      .then((result) => {
        setAddress((prevState) => ({
          ...prevState,
          legacyAddress: { ...prevState.legacyAddress, address: result },
        }));
      })
      .catch((err) => {
        throw err;
      });

    // get Bech (nested) address
    BtcPlugin.getNestedAddress(addressConfig)
      .then((result) => {
        setAddress((prevState) => ({
          ...prevState,
          nestedAddress: { ...prevState.nestedAddress, address: result },
        }));
      })
      .catch((err) => {
        throw err;
      });

    // get Bech32 address
    BtcPlugin.getBech32Address(addressConfig)
      .then((result) => {
        setAddress((prevState) => ({
          ...prevState,
          bech32Address: { ...prevState.bech32Address, address: result },
        }));
      })
      .catch((err) => {
        throw err;
      });
  }, [mnemonic, addressConfig]);

  return (
    <ThemeProvider theme={MuiTheme}>
      <div className="App">
        <div className="card" style={{ marginTop: "8rem" }}>
          <div className="card-body">
            <h5 className="card-title">Generate BTC Address</h5>
            <TextField
              id="outlined-basic"
              label="Seed"
              variant="outlined"
              helperText="in Hex"
              onChange={(event) => {
                setAddressConfig({
                  ...addressConfig,
                  seed: event.target.value,
                });
              }}
              value={addressConfig.seed}
            />
            <div>
              <h5></h5>
              <TextField
                id="outlined-basic"
                // label="Outlined"
                variant="outlined"
                label=" e.g. m / 44' / 0' / 0' / 0 / 0"
                style={{ width: "40%" }}
                helperText="Derive path: m / purpose' / coin' /	account'	/ chain	 / address"
                onChange={(event) => {
                  setAddressConfig({
                    ...addressConfig,
                    derivePath: event.target.value,
                  });
                }}
                value={addressConfig.derivePath}
              />
            </div>
            {showAddress()}
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default AddressGenerator;
