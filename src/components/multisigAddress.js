import React, { useEffect, useState } from "react";
import {
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Container,
  Modal,
  Tooltip,
  ThemeProvider,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
} from "@material-ui/core";
import MuiTheme from "../theme/index";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import CropFreeIcon from "@material-ui/icons/CropFree";
import { makeStyles } from "@material-ui/core/styles";
import BtcPlugin from "../plugin/btc_plugin";

let QRCode = require("qrcode.react");
let bip39 = require("bip39");

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 200,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  root: {
    margin: "0.5rem",
    padding: "2rem",
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
}));

function multisigAddress() {
  const classes = useStyles();

  const [tooltipText, setTooltipText] = useState("Copy to clipboard");
  const [publicKeys, setPublicKeys] = useState("");
  const [m, setM] = useState(0);
  const [n, setN] = useState(0);
  const [network, setNetwork] = useState(0);
  const [focus, setFocus] = useState("");
  const [helperTextError, setHelperTextError] = useState("");
  const [qrCode, setQrCode] = useState({});
  const [open, setOpen] = useState(false);
  const [address, setAddress] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  async function copyToClipboard(text) {
    await navigator.clipboard.writeText(text);
    setTooltipText("Copied!");
  }

  async function generateMultisigAddress() {
    try {
      setAddress("");

      // Input checking
      if (m <= 0 || m > n || n <= 0) {
        throw "m should be 0 < m <= n";
      }
      if (publicKeys == "") {
        throw "Missing public keys";
      }

      // Generate multi-sig p2sh address
      let mul_address = await BtcPlugin.getMultisigAddress(
        publicKeys.replace(/\s/g, "").split(","),
        m,
        n,
        network
      );
      setAddress(mul_address);
    } catch (err) {
      setHelperTextError(err.toString());
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
            justifyContent: "center",
          }}
        >
          {/* ============= Network selector ============= */}
          <FormControl
            className={classes.formControl}
            style={{ flex: 1, maxWidth: "3vw" }}
          >
            <InputLabel id="demo-simple-select">Select network</InputLabel>
            <Select
              id="selectNetwork2"
              style={{ marginBottom: 10 }}
              value={network}
              onChange={(e) => {
                setNetwork(e.target.value);
              }}
            >
              <MenuItem value={0}>Mainnet</MenuItem>
              <MenuItem value={1}>Testnet</MenuItem>
            </Select>
          </FormControl>

          {/* ============= M and N textfields ============= */}
          <Container
            style={{
              marginBottom: "2rem",
              marginTop: "1rem",
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <TextField
              error={focus == "m" && (m <= 0 || m > n)}
              id="outlined-basic"
              variant="outlined"
              label="M"
              type={"number"}
              style={{
                flex: 2,
                minWidth: 80,
                marginBottom: "1rem",
                marginRight: "0.25rem",
              }}
              helperText={
                focus == "m" && (m <= 0 || m > n)
                  ? "m should be 0 < m <= n"
                  : ""
              }
              onChange={(event) => {
                setAddress("");
                setFocus("m");
                setM(
                  event.target.value == ""
                    ? event.target.value
                    : parseInt(event.target.value)
                );
              }}
              value={m}
            />
            <Typography
              style={{
                flex: 1,
                color: "#fff",
                marginLeft: 5,
                marginRight: 5,
                marginBottom: 10,
                alignSelf: "center",
              }}
            >
              out of
            </Typography>
            <TextField
              error={focus == "n" && (n <= 0 || m > n)}
              id="outlined-basic"
              variant="outlined"
              label="N"
              type={"number"}
              style={{
                flex: 2,
                minWidth: 80,
                marginLeft: "0.25rem",
              }}
              helperText={
                focus == "n" && (n <= 0 || m > n)
                  ? "m should be 0 < m <= n"
                  : ""
              }
              onChange={(event) => {
                setAddress("");
                setFocus("n");
                setN(
                  event.target.value == ""
                    ? event.target.value
                    : parseInt(event.target.value)
                );
              }}
              value={n}
            />
          </Container>

          {/* ============= Public key textfield ============= */}
          <FormControl className={classes.formControl} style={{ flex: 1 }}>
            <TextField
              error={
                focus == "publicKeys" && (publicKeys == "" || helperTextError)
              }
              multiline
              aria-label="Public keys"
              variant="outlined"
              type={"text"}
              minRows={5}
              maxRows={Infinity}
              label="Public keys"
              placeholder='Public keys (split keys by ",")'
              style={{ flex: 1, marginBottom: 10 }}
              value={publicKeys}
              helperText={
                focus == "publicKeys" && helperTextError != ""
                  ? helperTextError
                  : ""
              }
              onChange={(e) => {
                setAddress("");
                setFocus("publicKeys");
                setPublicKeys(e.target.value);
              }}
            />
          </FormControl>
        </Box>

        <Button
          variant="contained"
          style={{
            backgroundColor: "#10AFAE",
            borderRadius: 25,
            maxWidth: "20rem",
            alignSelf: "center",
          }}
          onClick={() => generateMultisigAddress()}
        >
          Generate
        </Button>
      </Container>

      {address != "" ? (
        <Container
          style={{ marginTop: 40, marginBottom: 40, textAlign: "start" }}
        >
          {/* Address */}
          <Typography style={{ color: "#10AFAE" }} variant="subtitle1">
            Multisig P2SH address
          </Typography>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "row",
              flexWrap: "wrap",
            }}
          >
            <Tooltip
              title={tooltipText}
              aria-label={tooltipText}
              disableHoverListener={address == ""}
              arrow
              onClose={() =>
                setTimeout(() => setTooltipText("Copy to clipboard"), 300)
              }
            >
              <Typography
                style={{ color: "#fff", flex: 3 }}
                variant="body1"
                onClick={() => copyToClipboard(address)}
              >
                {address}
              </Typography>
            </Tooltip>
            {/* =============== BTC explorer button=============== */}
            <Tooltip
              title={"Open in BTC Explorer"}
              aria-label={"Open in BTC Explorer"}
              arrow
            >
              <IconButton
                style={{ color: "#fff", flex: 1 }}
                onClick={() =>
                  window.open(
                    `${config.blockchain_explorer_host}/btc/address/${address}`
                  )
                }
              >
                <OpenInNewIcon />
              </IconButton>
            </Tooltip>
            {/*  =============== QR code buttion =============== */}
            <Tooltip title={"Scan QR code"} aria-label={"Scan QR code"} arrow>
              <IconButton
                style={{ color: "#fff", flex: 1 }}
                onClick={() => {
                  handleOpen();
                  setQrCode(address);
                }}
              >
                <CropFreeIcon />
              </IconButton>
            </Tooltip>
          </div>
          {showModal()}
        </Container>
      ) : null}
    </ThemeProvider>
  );

  // QR code modal
  function showModal() {
    return Object.keys(qrCode).length > 0 ? (
      <Modal
        keepMounted
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Box sx={style}>
          <Typography style={{ marginBottom: "1rem" }}>
            {qrCode.name}: {qrCode.address}
          </Typography>
          <QRCode value={qrCode.address} />
        </Box>
      </Modal>
    ) : null;
  }
}

export default multisigAddress;
