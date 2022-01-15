"use strict"

const bitcoin = require("bitcoinjs-lib")
const bip39 = require("bip39")
const bip32 = require("bip32")
const axios = require("axios")
const config = require("../config/index")

class BtcPlugin {
	constructor() {
		this.network = { name: "Mainnet", network: bitcoin.networks.bitcoin }
		this.networkList = [
			{ name: "Mainnet", network: bitcoin.networks.bitcoin },
			{ name: "Testnet", network: bitcoin.networks.testnet }
		]
	}

	async getPublicKey(mnemonic, network, derivePath, passphrase) {
		return await bip39
			.mnemonicToSeed(mnemonic, passphrase)
			.then(seed => {
				let hdMaster = bip32.fromSeed(seed, bitcoin.networks[network])

				const BTC_xpub = hdMaster.derivePath(derivePath).neutered().toBase58()
				return BTC_xpub
			})
			.catch(err => {
				throw err
			})
	}
	async getPrivateKey(seed, network, derivePath) {
		let hdMaster = bip32.fromSeed(Buffer.from(seed, "hex"), bitcoin.networks[network])

		const BTC_prv = derivePath && derivePath != "m" ? hdMaster.derivePath(derivePath).toBase58() : hdMaster.toBase58()
		return BTC_prv
	}

	// Account gap limit check
	async isWalletUsed(seed) {
		let addr_arr = []
		for (let i = 0; i < 20; i++) {
			let address = await this.getNestedAddress({
				seed,
				purpose: 44,
				network: this.network.name == "Mainnet" ? 0 : 1,
				account: 0,
				chain: 0,
				index: i
			})
			addr_arr.push(address)
		}
		let result = await axios.get(`${config.btc_api_host}/${this.network.name == "Mainnet" ? "" : "testnet/"}multiaddr?active=${addr_arr.join("|")}`)
		return result.data.wallet.n_tx !== 0
	}

	async getPublicKeyBySeed(addressConfig) {
		try {
			let hdMaster = bip32.fromSeed(Buffer.from(addressConfig.seed, "hex"), bitcoin.networks[addressConfig.network == 0 ? "bitcoin" : "testnet"])

			const BTC_xpub =
				addressConfig.derivePath == "m"
					? hdMaster.neutered().toBase58()
					: hdMaster
							.derivePath(addressConfig.derivePath ? addressConfig.derivePath : `m/${addressConfig.purpose}'/${addressConfig.network}'/${addressConfig.account}'/${addressConfig.chain}`)
							.neutered()
							.toBase58()

			return BTC_xpub
		} catch (err) {
			throw err
		}
	}
	// Legacy P2PKH
	async getLegacyAddress(addressConfig) {
		try {
			const BTC_xpub = await this.getPublicKeyBySeed(addressConfig)
			const node = bip32.fromBase58(BTC_xpub, bitcoin.networks[addressConfig.network == 0 ? "bitcoin" : "testnet"])

			return bitcoin.payments.p2pkh({
				pubkey: node.derive(addressConfig.index).publicKey,
				network: bitcoin.networks[addressConfig.network == 0 ? "bitcoin" : "testnet"]
			}).address
		} catch (err) {
			throw err
		}
	}

	// Native segwit / bech32 address
	async getBech32Address(addressConfig) {
		const BTC_xpub = await this.getPublicKeyBySeed(addressConfig)
		const node = bip32.fromBase58(BTC_xpub, bitcoin.networks[addressConfig.network == 0 ? "bitcoin" : "testnet"])

		return bitcoin.payments.p2wpkh({
			pubkey: node.derive(addressConfig.index).publicKey,
			network: bitcoin.networks[addressConfig.network == 0 ? "bitcoin" : "testnet"]
		}).address
	}
	// Nested segwit / P2SH
	async getNestedAddress(addressConfig) {
		const BTC_xpub = await this.getPublicKeyBySeed(addressConfig)
		const node = bip32.fromBase58(BTC_xpub, bitcoin.networks[addressConfig.network == 0 ? "bitcoin" : "testnet"])

		return bitcoin.payments.p2sh({
			redeem: bitcoin.payments.p2wpkh({
				pubkey: node.derive(addressConfig.index).publicKey
			}),

			network: bitcoin.networks[addressConfig.network == 0 ? "bitcoin" : "testnet"]
		}).address
	}

	async mnemonicToSeed(mnemonic, passphrase) {
		return await bip39
			.mnemonicToSeed(mnemonic, passphrase)
			.then(bytes => bytes.toString("hex"))
			.then(seed => {
				return seed
			})
			.catch(err => {
				throw err
			})
	}

	async getMultisigAddress(publicKeyArray, m, n, network) {
		// sort the public key
		publicKeyArray.sort()

		let publicKeyBufferArray = publicKeyArray.map(publicKey => Buffer.from(publicKey, "hex"))

		const p2ms = bitcoin.payments.p2ms({
			m: m,
			pubkeys: publicKeyBufferArray,
			network: bitcoin.networks[network == 0 ? "bitcoin" : "testnet"]
		})
		const p2sh = bitcoin.payments.p2sh({
			redeem: p2ms,
			network: bitcoin.networks[network == 0 ? "bitcoin" : "testnet"]
		})

		return p2sh.address
	}
}

module.exports = new BtcPlugin()
