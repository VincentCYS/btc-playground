import React, { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { setBtc } from "../features/btcSlice"
import { Button, FormControl, InputLabel, Select, MenuItem, Box, Container, Tooltip, ThemeProvider, TextField, InputAdornment, IconButton, Typography } from "@material-ui/core"
import Visibility from "@material-ui/icons/Visibility"
import VisibilityOff from "@material-ui/icons/VisibilityOff"
import MuiTheme from "../theme/index"
import { makeStyles } from "@material-ui/core/styles"
import BtcPlugin from "../plugin/btc_plugin"

let bip39 = require("bip39")

const useStyles = makeStyles(theme => ({
	formControl: {
		margin: theme.spacing(1),
		minWidth: 200
	},
	selectEmpty: {
		marginTop: theme.spacing(2)
	},
	root: {
		margin: "0.5rem",
		padding: "2rem"
	},
	title: {
		fontSize: 14
	},
	pos: {
		marginBottom: 12
	}
}))

const menuProps = {
	anchorOrigin: {
		vertical: "bottom",
		horizontal: "left"
	},
	transformOrigin: {
		vertical: "top",
		horizontal: "left"
	},
	getContentAnchorEl: null
}

function MnemoicGenerator() {
	const classes = useStyles()

	const [tooltipText, setTooltipText] = useState("Copy to clipboard")
	const [showPassword, setShowPassword] = useState(false)
	const [showGenerateTooltip, setShowGenerateTooltip] = useState(false)
	const handleClickShowPassword = () => setShowPassword(!showPassword)
	const handleMouseDownPassword = () => setShowPassword(!showPassword)

	const btc = useSelector(state => state.btc)
	const dispatch = useDispatch()

	async function copyToClipboard(text) {
		if (text != "") {
			await navigator.clipboard.writeText(text)
			setTooltipText("Copied!")
		}
	}

	async function generateMnemonic() {
		let mnemonic = bip39.generateMnemonic(btc.entropy)

		try {
			let seed = await BtcPlugin.mnemonicToSeed(mnemonic)
			let privateKey = await BtcPlugin.getPrivateKey(seed, 0)

			dispatch(setBtc({ type: "setSeed", payload: seed }))
			dispatch(setBtc({ type: "setMnemonic", payload: mnemonic }))

			dispatch(setBtc({ type: "setPrivateKey", payload: privateKey }))
		} catch (err) {
			alert(err)
		}
	}

	return (
		<ThemeProvider theme={MuiTheme}>
			<Container style={{ display: "flex", flexDirection: "column" }}>
				<Box
					sx={{ minWidth: 120, marginTop: "2rem" }}
					style={{
						display: "flex",
						flexDirection: "row",
						flexWrap: "wrap",
						justifyContent: "center"
					}}
				>
					{/*  ============== Mnemonic word count selector ============== */}
					<FormControl className={classes.formControl} style={{ flex: 1, maxWidth: "3vw" }} variant="standard">
						<InputLabel>Select word count</InputLabel>
						<Select
							labelId="select-label"
							id="select"
							value={btc.wordCount}
							MenuProps={menuProps}
							onChange={e => {
								dispatch(setBtc({ type: "setWordCount", payload: e.target.value }))
								dispatch(setBtc({ type: "setSeed", payload: "" }))
								dispatch(setBtc({ type: "setMnemonic", payload: "" }))
								dispatch(setBtc({ type: "setPrivateKey", payload: "" }))
							}}
						>
							<MenuItem value={12}>12</MenuItem>
							<MenuItem value={15}>15</MenuItem>
							<MenuItem value={18}>18</MenuItem>
							<MenuItem value={21}>21</MenuItem>
						</Select>
					</FormControl>
					<FormControl className={classes.formControl} style={{ flex: 1, maxWidth: "3vw" }}>
						<InputLabel>Select network</InputLabel>
						<Select
							labelId="select-label"
							id="select"
							value={btc.network}
							MenuProps={menuProps}
							onChange={e => {
								dispatch(setBtc({ type: "setNetwork", payload: e.target.value }))
								dispatch(setBtc({ type: "setSeed", payload: "" }))
								dispatch(setBtc({ type: "setMnemonic", payload: "" }))
								dispatch(setBtc({ type: "setPrivateKey", payload: "" }))
							}}
						>
							<MenuItem value={0}>Mainnet</MenuItem>
							<MenuItem value={1}>Testnet</MenuItem>
						</Select>
					</FormControl>
				</Box>

				{/*  ============== Show Mnemonic ============== */}

				<Container
					style={{
						display: "flex",
						flexDirection: "column",
						marginBottom: 15
					}}
				>
					<Typography
						style={{
							color: "#10AFAE",
							textAlign: "start",
							marginTop: "1.5rem"
						}}
						variant="caption"
					>
						Mnemonic
					</Typography>
					<Tooltip title={tooltipText} aria-label={tooltipText} disableHoverListener={btc.mnemonic == ""} arrow onClose={() => setTimeout(() => setTooltipText("Copy to clipboard"), 300)}>
						<TextField
							variant="outlined"
							type={showPassword ? "text" : "password"}
							value={btc.mnemonic ? (!showPassword ? "************************************" : btc.mnemonic) : ""}
							style={{
								flex: 1,
								width: "90%",
								textTransform: "none",
								borderColor: "#fff",
								color: "#fff"
							}}
							multiline
							onChange={async e => {
								dispatch(setBtc({ type: "setMnemonic", payload: e.target.value }))
								dispatch(setBtc({ type: "setSeed", payload: "" }))
								dispatch(setBtc({ type: "setPrivateKey", payload: "" }))

								if (e.target.value != "") {
									let seed = await BtcPlugin.mnemonicToSeed(e.target.value)
									dispatch(setBtc({ type: "setSeed", payload: seed }))
									let privateKey = await BtcPlugin.getPrivateKey(seed, btc.network, "m")
									dispatch(setBtc({ type: "setPrivateKey", payload: privateKey }))
								}
							}}
							onClick={() => copyToClipboard(btc.mnemonic)}
							// Show/hide wallet mnemonic
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<IconButton
											style={{
												margin: 1,
												color: "#fff"
											}}
											aria-label="toggle password visibility"
											onClick={handleClickShowPassword}
											onMouseDown={handleMouseDownPassword}
										>
											{showPassword ? <Visibility /> : <VisibilityOff />}
										</IconButton>
									</InputAdornment>
								)
							}}
						/>
					</Tooltip>
				</Container>

				{/*  ============== Show seed ============== */}
				<Container
					style={{
						display: "flex",
						flexDirection: "column",
						marginBottom: 15
					}}
				>
					<Typography
						style={{
							color: "#10AFAE",
							textAlign: "start",
							justifySelf: "start"
						}}
						variant="caption"
					>
						Seed
					</Typography>
					<Tooltip title={tooltipText} aria-label={tooltipText} disableHoverListener={btc.seed == ""} arrow onClose={() => setTimeout(() => setTooltipText("Copy to clipboard"), 300)}>
						<TextField
							variant="outlined"
							type={showPassword ? "text" : "password"}
							value={btc.seed ? btc.seed : ""}
							style={{
								height: "auto",
								width: "90%",
								textTransform: "none",
								wordBreak: "break-all",
								borderColor: "#fff",
								color: "#fff"
							}}
							onChange={async e => {
								dispatch(setBtc({ type: "setMnemonic", payload: "" }))
								dispatch(setBtc({ type: "setSeed", payload: e.target.value }))
								dispatch(setBtc({ type: "setPrivateKey", payload: "" }))

								let privateKey = await BtcPlugin.getPrivateKey(e.target.value, btc.network, "m")
								dispatch(setBtc({ type: "setPrivateKey", payload: privateKey }))
							}}
							onClick={() => copyToClipboard(btc.seed)}
							// Show/hide wallet seed
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<IconButton style={{ color: "#fff", margin: 1 }} aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword}>
											{showPassword ? <Visibility /> : <VisibilityOff />}
										</IconButton>
									</InputAdornment>
								)
							}}
						/>
					</Tooltip>
				</Container>

				{/*  ============== Private key (in base58) ============== */}
				<Container
					style={{
						display: "flex",
						flexDirection: "column",
						marginBottom: "4rem"
					}}
				>
					<Typography
						style={{
							color: "#10AFAE",
							textAlign: "start"
						}}
						variant="caption"
					>
						Private key (in base58)
					</Typography>
					<Tooltip title={tooltipText} aria-label={tooltipText} disableHoverListener={btc.mnemonic == ""} arrow onClose={() => setTimeout(() => setTooltipText("Copy to clipboard"), 300)}>
						<TextField
							variant="outlined"
							type={showPassword ? "text" : "password"}
							value={btc.privateKey ? btc.privateKey : ""}
							style={{
								height: "3vw",
								width: "90%",
								textTransform: "none",
								borderColor: "#fff",
								color: "#fff"
							}}
							onClick={() => copyToClipboard(btc.privateKey)}
							// Show/hide wallet mnemonic
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<IconButton
											style={{
												margin: 1,
												color: "#fff"
											}}
											aria-label="toggle password visibility"
											onClick={handleClickShowPassword}
											onMouseDown={handleMouseDownPassword}
										>
											{showPassword ? <Visibility /> : <VisibilityOff />}
										</IconButton>
									</InputAdornment>
								)
							}}
						/>
					</Tooltip>
				</Container>
				<Tooltip title={"Address changed!"} aria-label={"Address changed!"} arrow open={showGenerateTooltip} onClose={() => setTimeout(() => setShowGenerateTooltip(false), 500)}>
					<Button
						variant="contained"
						style={{
							backgroundColor: "#10AFAE",
							borderRadius: 25,
							maxWidth: "20rem",
							alignSelf: "center"
						}}
						onClick={() => {
							generateMnemonic()
							setShowGenerateTooltip(true)
						}}
					>
						Generate Mnemonic
					</Button>
				</Tooltip>
			</Container>
		</ThemeProvider>
	)
}

export default MnemoicGenerator
