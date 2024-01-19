import { SealedBox, KeyPair } from "./crypto.js";

describe("KeyPair", () => {
	it("can serialize and deserialize", async () => {
		const original = await KeyPair.generate();
		const serialized = original.toStringKeyPair();
		const deserialized = await KeyPair.fromStringKeyPair(serialized);
		expect(deserialized).toMatchObject(original);
	});
});

describe("SealedBox", () => {
	it("can encrypt and decrypt", async () => {
		const key = await KeyPair.generate();
		const box = await SealedBox.seal("Hello, world!", key);
		const serialized = box.toBase64();
		const deserialized = SealedBox.fromBase64(serialized);
		expect(await deserialized.open(key, "text")).toBe("Hello, world!");
	});
});
