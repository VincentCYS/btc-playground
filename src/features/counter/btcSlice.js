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
  },
});

export const { setMnemonic, setSeed, setWordCount } = btcSlice.actions;

export default btcSlice.reducer;
