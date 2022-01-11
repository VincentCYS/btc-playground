"use strict";

const bitcoin = require("bitcoinjs-lib");
const bip39 = require("bip39");
const bip32 = require("bip32");
const axios = require("axios");
const config = require("../config/index");

class BtcPlugin {
  constructor() {
    this.network = { name: "Mainnet", network: bitcoin.networks.bitcoin };
    this.networkList = [
      { name: "Mainnet", network: bitcoin.networks.bitcoin },
      { name: "Testnet", network: bitcoin.networks.testnet },
      { name: "Regtest", network: bitcoin.networks.regtest },
    ];
  }
  async getPublicKey(mnemonic, derivePath) {
    return await bip39
      .mnemonicToSeed(mnemonic)
      .then((seed) => {
        var hdMaster = bip32.fromSeed(seed, this.network.network);

        const BTC_xpub = hdMaster.derivePath(derivePath).neutered().toBase58();
        return BTC_xpub;
      })
      .catch((err) => {
        throw err;
      });
  }
  async isWalletUsed(seed) {
    let addr_arr = [];
    for (let i = 0; i < 20; i++) {
      let address = await this.getNestedAddress({
        seed,
        purpose: 44,
        network: this.network.name == "Mainnet" ? 0 : 1,
        account: 0,
        chain: 0,
        index: i,
      });
      addr_arr.push(address);
    }
    let result = await axios.get(
      `${config.btc_api_host}/multiaddr?active=${addr_arr.join("|")}`
    );
    return result.data.wallet.n_tx !== 0;
  }
  async getPublicKeyBySeed(addressConfig) {
    var hdMaster = bip32.fromSeed(
      Buffer.from(addressConfig.seed, "hex"),
      this.network.network
    );
    const BTC_xpub = hdMaster
      .derivePath(
        addressConfig.derivePath
          ? addressConfig.derivePath
          : `m/${addressConfig.purpose}'/${addressConfig.network}'/${addressConfig.account}'/${addressConfig.chain}`
      )
      .neutered()
      .toBase58();
    return BTC_xpub;
  }
  async getLegacyAddress(addressConfig) {
    try {
      const BTC_xpub = await this.getPublicKeyBySeed(addressConfig);
      const node = bip32.fromBase58(BTC_xpub, this.network.network);

      return bitcoin.payments.p2pkh({
        pubkey: node.derive(addressConfig.index).publicKey,
        network: this.network.network,
      }).address;
    } catch (err) {
      throw err;
    }
  }
  async getBech32Address(addressConfig) {
    const BTC_xpub = await this.getPublicKeyBySeed(addressConfig);
    const node = bip32.fromBase58(BTC_xpub, this.network.network);

    return bitcoin.payments.p2wpkh({
      pubkey: node.derive(addressConfig.index).publicKey,
      network: this.network.network,
    }).address;
  }
  async getNestedAddress(addressConfig) {
    const BTC_xpub = await this.getPublicKeyBySeed(addressConfig);
    const node = bip32.fromBase58(BTC_xpub, this.network.network);

    return bitcoin.payments.p2sh({
      redeem: bitcoin.payments.p2wpkh({
        pubkey: node.derive(addressConfig.index).publicKey,
      }),

      network: this.network.network,
    }).address;
  }

  async mnemonicToSeed(mnemonic) {
    return await bip39
      .mnemonicToSeed(mnemonic)
      .then((seed) => {
        return seed;
      })
      .catch((err) => {
        throw err;
      });
  }
}

module.exports = new BtcPlugin();
