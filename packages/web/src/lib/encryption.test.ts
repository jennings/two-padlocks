import { describe, expect, it } from "vitest";
import { KeyPair, SealedBox, createContext } from "./encryption.js";

describe("KeyPair", () => {
	it("can serialize and deserialize", async () => {
		const context = await createContext();
		const original = KeyPair.generate(context);
		const serialized = original.toStringKeyPair();
		const deserialized = KeyPair.fromStringKeyPair(context, serialized);
		expect(deserialized.toStringKeyPair()).toMatchObject(original.toStringKeyPair());
	});
});

describe("SealedBox", () => {
	it("can encrypt and decrypt", async () => {
		const context = await createContext();
		const key = KeyPair.generate(context);
		const box = SealedBox.seal(context, "Hello, world!", key);
		const serialized = box.toBase64();
		const deserialized = SealedBox.fromBase64(context, serialized);
		expect(deserialized.open(context, key, "text")).toBe("Hello, world!");
	});
});
