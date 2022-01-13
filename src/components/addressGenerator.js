import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  FormControl,
  TextField,
  ThemeProvider,
  IconButton,
  Container,
  Box,
  Checkbox,
  Modal,
  Tooltip,
  Typography,
  InputLabel,
  Select,
  MenuItem,
  Backdrop,
  Divider,
  Grid,
} from "@material-ui/core";
import BtcPlugin from "../plugin/btc_plugin";
import Table from "./table";
import MuiTheme from "../theme/index";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import CropFreeIcon from "@material-ui/icons/CropFree";
import InfoIcon from "@material-ui/icons/Info";
import config from "../config/index";

let QRCode = require("qrcode.react");

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "#fff",
  border: "2px solid #fff",
  boxShadow: 24,
  p: 4,
  textAlign: "center",
  borderRadius: 35,
};
function AddressGenerator() {
  const mnemonic = useSelector((state) => state.btc.mnemonic);
  let [address, setAddress] = useState([
    {
      legacyAddress: {
        name: "Legacy Address",
        address: "",
      },
      nestedAddress: {
        name: "Segwit Address",
        address: "",
      },
      bech32Address: {
        name: "Segwit Native Address",
        address: "",
      },
    },
  ]);
  const [publicKey, setPublicKey] = useState("");

  let [addressConfig, setAddressConfig] = useState({
    seed: "",
    purpose: 44,
    network: 0,
    account: 0,
    chain: 0,
    index: 0,
    derivePath: "",
  });

  let [derivePathSelectors, setDerivePathSelectors] = useState({
    paths: [
      {
        label: "Purpose",
        divider: "'/",
        value: 44,
        name: "purpose",
        items: [
          {
            name: "44",
            value: 44,
          },
        ],
      },
      {
        label: "Network",
        helpText: "BTC Network",
        divider: "'/",
        name: "network",
        value: 0,
        items: [
          {
            name: "Mainnet",
            value: 0,
          },
          {
            name: "Testnet",
            value: 1,
          },
        ],
      },
      {
        label: "Chain",
        divider: "'/",
        name: "chain",
        value: 0,
        items: [
          {
            name: "External",
            value: 0,
          },
          {
            name: "Internal",
            value: 1,
          },
        ],
      },
    ],
  });

  const [qrCode, setQrCode] = useState({});
  const [open, setOpen] = useState(false);
  const [helperTextError, setHelperTextError] = useState("");
  const [tooltipText, setTooltipText] = useState("Copy to clipboard");
  const [focus, setFocus] = useState("");
  const [isWalletUsed, setIsWalletUsed] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showMoreAddress, setShowMoreAddress] = useState(false);
  const [addressCount, setAddressCount] = useState(1);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleChange = (event, i) => {
    let newPath = derivePathSelectors.paths;
    newPath[i].value = event.target.value;
    setDerivePathSelectors({ paths: newPath });
    setAddressConfig({ ...addressConfig, [newPath[i].name]: newPath[i].value });
  };

  async function copyToClipboard(text) {
    await navigator.clipboard.writeText(text);
    setTooltipText("Copied!");
  }

  async function getAddress(tempAddressConfig) {
    // Get public key seed
    BtcPlugin.getPublicKeyBySeed(tempAddressConfig)
      .then((result) => {
        setPublicKey(result);
      })
      .catch((err) => {
        throw err;
      });

    // Check account gap limit
    BtcPlugin.isWalletUsed(tempAddressConfig.seed).then((result) => {
      setIsWalletUsed(result);
    });

    // Get address list
    let addressList = [];
    for (
      let i = addressConfig.index;
      i < addressConfig.index + addressCount;
      i++
    ) {
      tempAddressConfig.index = i;

      try {
        setHelperTextError("");

        // Get btc address
        addressList.push({
          index: i,
          path: `m/${tempAddressConfig.purpose}'/${tempAddressConfig.network}'/${tempAddressConfig.account}'/${tempAddressConfig.chain}/${tempAddressConfig.index}`,
          legacyAddress: {
            name: "Legacy Address",
            address: await BtcPlugin.getLegacyAddress(tempAddressConfig),
          },
          nestedAddress: {
            name: "Segwit Address",
            address: await BtcPlugin.getLegacyAddress(tempAddressConfig),
          },
          bech32Address: {
            name: "Segwit Native Address",
            address: await BtcPlugin.getLegacyAddress(tempAddressConfig),
          },
        });
      } catch (err) {
        setHelperTextError(err.toString());
        throw err;
      }
    }
    setAddress(addressList);
  }

  useEffect(() => {
    setAddress([
      {
        legacyAddress: {
          name: "Legacy Address",
          address: "",
        },
        nestedAddress: {
          name: "Segwit Address",
          address: "",
        },
        bech32Address: {
          name: "Segwit Native Address",
          address: "",
        },
      },
    ]);
    let tempAddressConfig = JSON.parse(JSON.stringify(addressConfig));

    getAddress(tempAddressConfig);
  }, [mnemonic, addressConfig, addressCount]);

  return (
    <ThemeProvider theme={MuiTheme}>
      <Box sx={{ minWidth: 120, marginTop: "3rem" }}>
        <Grid spacing={3}>
          {/* ================ Seed textfield ================ */}
          <TextField
            error={
              focus == "seed" &&
              helperTextError != "" &&
              addressConfig.seed != ""
            }
            id="outlined-basic"
            label="Seed"
            variant="outlined"
            helperText={
              (focus == "seed" && helperTextError == "") ||
              addressConfig.seed == ""
                ? "Please paste your wallet seed (in Hex)"
                : helperTextError
            }
            style={{ marginBottom: "2rem" }}
            onChange={(event) => {
              setFocus("seed");
              setAddressConfig({
                ...addressConfig,
                seed: event.target.value,
              });
            }}
            value={addressConfig.seed}
          />

          {/* ================ Easy version derive path ================ */}
          {showDerivePathSelector()}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: 10,
              marginRight: 5,
              marginBottom: 10,
            }}
          >
            <Typography
              style={{
                color: "#10AFAE",
                textAlign: "start",
              }}
              variant="caption"
            >
              Show advanced derive path settings
            </Typography>
            <Checkbox
              value={showAdvanced}
              style={{ color: "#fff" }}
              onChange={() => {
                setShowAdvanced(!showAdvanced);
              }}
            />
          </div>

          {/* ================ Advanced derive path ================ */}
          {showAdvanced ? (
            <TextField
              error={
                focus == "derivePath" &&
                helperTextError != "" &&
                addressConfig.derivePath != ""
              }
              id="outlined-basic"
              variant="outlined"
              label="Derive path"
              style={{ width: "100%" }}
              helperText={
                (focus == "derivePath" && helperTextError == "") ||
                addressConfig.derivePath == ""
                  ? "Derive path: m / purpose' / coin' /	account'	/ chain	 / address"
                  : helperTextError
              }
              onChange={(event) => {
                setFocus("derivePath");

                setAddressConfig({
                  ...addressConfig,
                  derivePath: event.target.value,
                });
              }}
              value={
                addressConfig.derivePath ||
                `m/${addressConfig.purpose}'/${addressConfig.network}'/${addressConfig.chain}'/${addressConfig.account}/${addressConfig.index}`
              }
            />
          ) : null}
        </Grid>
        {address.length > 0 && addressConfig.seed != "" ? (
          <Divider
            variant="middle"
            style={{ marginTop: 40, marginBottom: 40, backgroundColor: "#fff" }}
          />
        ) : null}

        <Grid container spacing={3}>
          {/* ==================== Show more address checkbox ==================== */}
          {addressConfig.seed != "" ? (
            <Container
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 10,
                marginBottom: 10,
              }}
            >
              <Container style={{ alignItems: "center", display: "flex" }}>
                <Typography
                  style={{
                    color: !isWalletUsed ? "#10AFAE" : "red",
                    marginRight: 5,
                  }}
                  variant="caption"
                >
                  {/* ==================== Account gap limit check ==================== */}
                  {!isWalletUsed
                    ? "Gap limit check passed"
                    : "Gap limit check failed"}
                </Typography>
                <Tooltip
                  title={
                    "Address gap limit is currently set to 20. If the software hits 20 unused addresses (no transactions associated with that address) in a row, it expects there are no used addresses beyond this point and stops searching the address chain."
                  }
                  arrow
                >
                  <InfoIcon style={{ color: "#fff" }} />
                </Tooltip>
              </Container>
              <Container>
                <Typography
                  style={{
                    color: "#10AFAE",
                    textAlign: "start",
                  }}
                  variant="caption"
                >
                  Show 20 addresses
                </Typography>
                <Checkbox
                  value={showMoreAddress}
                  style={{ color: "#fff" }}
                  onChange={() => {
                    if (addressConfig.seed != "") {
                      setAddressCount(addressCount == 1 ? 20 : 1);
                      setShowMoreAddress(!showMoreAddress);
                    }
                  }}
                />
              </Container>
            </Container>
          ) : null}
        </Grid>
        {/* ==================== show address list ==================== */}
        {address.length > 0 ? (
          showMoreAddress && address.length == 20 && addressCount == 20 ? (
            renderTable()
          ) : (
            <div>{showAddress()}</div>
          )
        ) : null}
      </Box>
      {showModal()}
    </ThemeProvider>
  );

  // Address table
  function renderTable() {
    let rows = address;
    rows.map((_) => {
      if (Object.keys(_).length > 0) {
        _.legacyAddress = _.legacyAddress.address || "";
        _.nestedAddress = _.nestedAddress.address || "";
        _.bech32Address = _.bech32Address.address || "";
      }
    });
    return <Table rows={rows} />;
  }

  // Easy version derive path selector
  function showDerivePathSelector() {
    return (
      <Container>
        <Container
          style={{
            marginBottom: "2rem",
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
          }}
        >
          {/* Purpose */}
          {derivePathSelectors.paths.length > 0
            ? derivePathSelectors.paths.map((selector, i) => {
                return (
                  <FormControl
                    style={{
                      minWidth: 80,
                      marginBottom: "1rem",
                      flex: 1,
                    }}
                  >
                    <InputLabel id="demo-simple-select-helper-label">
                      {selector.label}
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-helper-label"
                      id="demo-simple-select-helper"
                      value={selector.value}
                      label={selector.label}
                      onChange={(e) => handleChange(e, i)}
                    >
                      {selector.items.length > 0
                        ? selector.items.map((item) => {
                            return (
                              <MenuItem value={item.value}>
                                {item.name}
                              </MenuItem>
                            );
                          })
                        : null}
                    </Select>
                  </FormControl>
                );
              })
            : null}
        </Container>
        <Container
          style={{
            marginBottom: "2rem",
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {/* Account */}
          <TextField
            error={
              focus == "account" &&
              helperTextError != "" &&
              addressConfig.account == "" &&
              addressConfig.account.toString() != "0"
            }
            id="outlined-basic"
            variant="outlined"
            label="Account"
            type={"number"}
            style={{
              flex: 1,
              minWidth: 80,
              marginBottom: "1rem",
              marginLeft: "0.25rem",
              marginRight: "0.25rem",
            }}
            helperText={
              focus == "account" &&
              helperTextError != "" &&
              addressConfig.account == "" &&
              addressConfig.account.toString() != "0"
                ? helperTextError
                : ""
            }
            onChange={(event) => {
              setFocus("account");
              setAddressConfig({
                ...addressConfig,
                account:
                  parseInt(event.target.value) >= 0
                    ? parseInt(event.target.value)
                    : 0,
              });
            }}
            value={addressConfig.account}
          />

          {/* Address index */}
          <TextField
            error={
              focus == "index" &&
              helperTextError != "" &&
              addressConfig.index == "" &&
              addressConfig.index.toString() != "0"
            }
            id="outlined-basic"
            variant="outlined"
            label="Address Index"
            type={"number"}
            style={{
              flex: 1,
              minWidth: 80,
              marginLeft: "0.25rem",
              marginRight: "0.25rem",
            }}
            helperText={
              focus == "index" &&
              helperTextError != "" &&
              addressConfig.index == "" &&
              addressConfig.index.toString() != "0"
                ? helperTextError
                : ""
            }
            onChange={(event) => {
              setFocus("index");
              setAddressConfig({
                ...addressConfig,
                index:
                  parseInt(event.target.value) >= 0
                    ? parseInt(event.target.value)
                    : 0,
              });
            }}
            value={addressConfig.index}
          />
        </Container>
      </Container>
    );
  }

  // Show QR code
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

  // Show address list
  function showAddress() {
    let tempAddress = address;
    if (tempAddress.length > 0) {
      tempAddress = tempAddress[0];
      delete tempAddress.index;
      delete tempAddress.path;
    }
    return Object.keys(tempAddress).length > 0 ? (
      <div>
        {Object.keys(tempAddress).map((_) =>
          tempAddress[_].address != "" && addressConfig.seed != "" ? (
            <Container style={{ marginTop: 30, textAlign: "start" }}>
              {/* Address */}
              <Typography style={{ color: "#10AFAE" }} variant="body1">
                {tempAddress[_].name}
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
                  disableHoverListener={tempAddress[_].address == ""}
                  arrow
                  onClose={() =>
                    setTimeout(() => setTooltipText("Copy to clipboard"), 300)
                  }
                >
                  <Typography
                    style={{ color: "#fff", flex: 3 }}
                    variant="caption"
                    onClick={() => copyToClipboard(tempAddress[_].address)}
                  >
                    {tempAddress[_].address}
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
                        `${config.blockchain_explorer_host}/btc/address/${tempAddress[_].address}`
                      )
                    }
                  >
                    <OpenInNewIcon />
                  </IconButton>
                </Tooltip>
                {/*  =============== QR code buttion =============== */}
                <Tooltip
                  title={"Scan QR code"}
                  aria-label={"Scan QR code"}
                  arrow
                >
                  <IconButton
                    style={{ color: "#fff", flex: 1 }}
                    onClick={() => {
                      handleOpen();
                      setQrCode(tempAddress[_]);
                    }}
                  >
                    <CropFreeIcon />
                  </IconButton>
                </Tooltip>
              </div>
            </Container>
          ) : null
        )}
        {/* ==================== Public key ==================== */}
        {publicKey && tempAddress.legacyAddress.address ? (
          <Container>
            <Typography
              style={{
                color: "#10AFAE",
                textAlign: "start",
                marginTop: 10,
              }}
              variant="body1"
            >
              Public key
            </Typography>
            <Tooltip
              title={tooltipText}
              aria-label={tooltipText}
              disableHoverListener={publicKey == ""}
              arrow
              onClose={() =>
                setTimeout(() => setTooltipText("Copy to clipboard"), 300)
              }
            >
              <Typography
                style={{ color: "#fff", wordBreak: "break-all" }}
                variant="caption"
                onClick={() => copyToClipboard(publicKey)}
              >
                {publicKey}
              </Typography>
            </Tooltip>
          </Container>
        ) : null}
      </div>
    ) : null;
  }
}

export default AddressGenerator;
