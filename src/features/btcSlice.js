import { createSlice } from "@reduxjs/toolkit";
const bitcoin = require("bitcoinjs-lib");

export const btcSlice = createSlice({
  name: "btc",
  initialState: {
    entropy: (15 * 32 * 11) / 33,
    wordCount: 15,
    mnemonic: "",
    seed: "",
    network: { name: "Mainnet", network: bitcoin.networks.bitcoin },
  },
  reducers: {
    setBtc: (state, action) => {
      action = action.payload;

      switch (action.type) {
        case "setMnemonic": {
          return {
            ...state,
            mnemonic: action.payload,
          };
        }

        case "setSeed": {
          return {
            ...state,
            seed: action.payload,
          };
        }
        case "setWordCount": {
          return {
            ...state,
            wordCount: action.payload,
          };
        }
        case "setNetwork": {
          return {
            ...state,
            network: action.payload,
          };
        }

        default:
          return state;
      }
    },
  },
});

export const { setBtc } = btcSlice.actions;

export default btcSlice.reducer;
