import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/btcSlice";

export default configureStore({
  reducer: {
    btc: counterReducer,
  },
});
