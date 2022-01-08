"use strict";

const bitcoin = require("bitcoinjs-lib");
const bip39 = require("bip39");
const bip32 = require("bip32");

class BtcPlugin {
  constructor() {
    this.network = bitcoin.networks.bitcoin;
  }
  async getPublicKey(mnemonic, derivePath) {
    return await bip39
      .mnemonicToSeed(mnemonic)
      .then((seed) => {
        var hdMaster = bip32.fromSeed(seed, this.network);
        const BTC_xpub = hdMaster.derivePath(derivePath).neutered().toBase58();
        return BTC_xpub;
      })
      .catch((err) => {
        throw err;
      });
  }
  async getPublicKeyBySeed(addressConfig) {
    var hdMaster = bip32.fromSeed(
      Buffer.from(addressConfig.seed, "hex"),
      this.network
    );
    const BTC_xpub = hdMaster
      .derivePath(
        `m/${addressConfig.purpose}'/${addressConfig.network}'/${addressConfig.account}'/${addressConfig.chain}`
      )
      .neutered()
      .toBase58();
    return BTC_xpub;
  }
  async getLegacyAddress(addressConfig) {
    try {
      const BTC_xpub = await this.getPublicKeyBySeed(addressConfig);
      const node = bip32.fromBase58(BTC_xpub, this.network);

      return bitcoin.payments.p2pkh({
        pubkey: node.derive(addressConfig.index).publicKey,
        network: this.network,
      }).address;
    } catch (err) {
      console.log("===> err", err);
      throw err;
    }
  }
  async getBech32Address(addressConfig) {
    const BTC_xpub = await this.getPublicKeyBySeed(addressConfig);
    const node = bip32.fromBase58(BTC_xpub, this.network);

    return bitcoin.payments.p2wpkh({
      pubkey: node.derive(addressConfig.index).publicKey,
      network: this.network,
    }).address;
  }
  async getNestedAddress(addressConfig) {
    const BTC_xpub = await this.getPublicKeyBySeed(addressConfig);
    const node = bip32.fromBase58(BTC_xpub, this.network);

    return bitcoin.payments.p2sh({
      redeem: bitcoin.payments.p2wpkh({
        pubkey: node.derive(addressConfig.index).publicKey,
      }),

      network: this.network,
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
