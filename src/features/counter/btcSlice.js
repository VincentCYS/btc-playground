import { createSlice } from "@reduxjs/toolkit";

export const btcSlice = createSlice({
  name: "btc",
  initialState: {
    entropy: (15 * 32 * 11) / 33,
    wordCount: 15,
    mnemonic: "",
    seed: "",
  },
  reducers: {
    setMnemonic: (state, newMnemonic) => {
      state.mnemonic = newMnemonic.payload;
    },
    setSeed: (state, newSeed) => {
      state.seed = newSeed.payload;
    },
    setWordCount: (state, newWordCount) => {
      state.wordCount = newWordCount.payload;
    },
    // generateMnemonic: async (state) => {
    //   let mnemonic = bip39.generateMnemonic(state.entropy);

    //   let seed = await BtcPlugin.mnemonicToSeed(mnemonic)
    //     .then((bytes) => bytes.toString("hex"))
    //     .then((seed) => {
    //       return seed;
    //     })
    //     .catch((err) => console.log(err));
    //   state.mnemonic = mnemonic;
    //   state.seed = seed;
    // },
  },
});

// Action creators are generated for each case reducer function
export const { setMnemonic, setSeed, setWordCount } = btcSlice.actions;

export default btcSlice.reducer;
