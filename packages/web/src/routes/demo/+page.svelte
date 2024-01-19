<script lang="ts">
  import { onMount } from "svelte";
  import type { StringKeyPair, StringPublicKey } from "two-padlocks-core/crypto";
  import { SealedBox, PublicKey, KeyPair } from "two-padlocks-core/crypto";

  let serializedKey: StringKeyPair | undefined;
  let serializedPublicKey: StringPublicKey | undefined;
  let plaintext: string | undefined;
  let ciphertext: string | undefined;
  let decryptedPlaintext: string | undefined;

  async function go() {
    const key = await KeyPair.generate();
    serializedKey = key.toStringKeyPair();
    serializedPublicKey = key.toStringPublicKey();
    plaintext = "Hello, world!";
    const box = await SealedBox.seal(plaintext, key);
    ciphertext = box.toBase64();

    const reconstructedBox = SealedBox.fromBase64(ciphertext);
    decryptedPlaintext = await reconstructedBox.open(key, "text");
  }

  onMount(go);
</script>

<h1>Demo</h1>

{#if serializedKey}
  <div>
    <div>
      <label
        >Key type
        <input readonly value={serializedKey.keyType} />
      </label>
    </div>
    <div>
      <label
        >Public key
        <input readonly value={serializedKey.publicKey} />
      </label>
    </div>
    <div>
      <label
        >Private key
        <input readonly value={serializedKey.privateKey} />
      </label>
    </div>
  </div>
{/if}
{#if serializedPublicKey}
  <div>
    <div>
      <label
        >Key type
        <input readonly value={serializedPublicKey.keyType} />
      </label>
    </div>
    <div>
      <label
        >Public key
        <input readonly value={serializedPublicKey.publicKey} />
      </label>
    </div>
  </div>
{/if}
{#if plaintext}
  <div>
    <label>Plaintext <textarea readonly value={plaintext} /></label>
  </div>
{/if}
{#if ciphertext}
  <div>
    <label>Ciphertext <textarea readonly value={ciphertext} /></label>
  </div>
{/if}
{#if decryptedPlaintext}
  <div>
    <label>Decrypted plaintext <textarea readonly value={decryptedPlaintext} /></label>
  </div>
{/if}

<button on:click={go}>Redo</button>

<div class="container">
  <div>
    <h2>Recipient</h2>
    <div>The recipient generates a key pair.</div>
    <div></div>
  </div>

  <div>
    <h2>Sender</h2>
    <div>f</div>
    <div>Visits the URL</div>
  </div>
</div>

<style>
  .container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
  .container > * {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: subgrid;
    border: solid 1px grey;
  }
</style>
