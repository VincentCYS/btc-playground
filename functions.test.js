const Btc_plugin = require("./src/plugin/btc_plugin")
const bip32_testing = require("./testingData/bip32_testing.json")
const bip67_testing = require("./testingData/bip67_testing.json")
const public_key_vectors = require("./testingData/root_private_key_vectors.json").english

describe("BTC plugin test", () => {
	test("Convert mnemonic To Seed", async () => {
		for (let i = 0; i < public_key_vectors.length; i++) {
			let seed = await Btc_plugin.mnemonicToSeed(public_key_vectors[i][1], "TREZOR")
			await expect(seed).toBe(public_key_vectors[i][2])
		}
	})
	test("Generate root private key", async () => {
		for (let i = 0; i < public_key_vectors.length; i++) {
			let privateKey = await Btc_plugin.getPrivateKey(public_key_vectors[i][2], 0)
			await expect(privateKey).toBe(public_key_vectors[i][3])
		}
	})
	test("Generate extended public and private key", async () => {
		for (let i = 0; i < bip32_testing.length; i++) {
			for (let j = 0; j < bip32_testing[i].list.length; j++) {
				// public key
				let publicKey = await Btc_plugin.getPublicKeyBySeed({
					seed: bip32_testing[i].seed,
					network: 0,
					derivePath: bip32_testing[i].list[j].chain
				})
				await expect(publicKey).toBe(bip32_testing[i].list[j].pub)

				// private key
				let privateKey = await Btc_plugin.getPrivateKey(bip32_testing[i].seed, 0, bip32_testing[i].list[j].chain)

				await expect(privateKey).toBe(bip32_testing[i].list[j].prv)
			}
		}
	})
	test("Generate multisig addresses", async () => {
		for (let i = 0; i < bip67_testing.length; i++) {
			let address = await Btc_plugin.getMultisigAddress(bip67_testing[i].list, 2, bip67_testing[i].list.length, 0)
			await expect(address).toBe(bip67_testing[i].address)
		}
	})
})
