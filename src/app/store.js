import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/btcSlice";

export default configureStore({
  reducer: {
    btc: counterReducer,
  },
});
