import React from "react"
import ReactDOM from "react-dom"

import "./index.css"
import App from "./App.js"
import { Provider } from "react-redux"
import store from "./app/store"
import { Helmet } from "react-helmet"

document.body.style.backgroundColor = "#081414"

document.body.style.backgroundImage = "linear-gradient(90deg, #323535 0%, #2B202B 100%)"

ReactDOM.render(
	<Provider store={store}>
		<Helmet>
			<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no" />
		</Helmet>
		<App />
	</Provider>,

	document.getElementById("app-container")
)
