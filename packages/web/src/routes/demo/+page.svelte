<script lang="ts">
  import type { Context } from "$lib/encryption";
  import { KeyPair, SealedBox, createContext } from "$lib/encryption";
  import clipboardCopy from "clipboard-copy";
  import { onMount } from "svelte";

  let context: Context | undefined;
  let key: KeyPair | undefined;
  $: serializedKey = key?.toStringKeyPair();
  $: serializedPublicKey = key?.toStringPublicKey();
  $: requestUrl = key ? buildRequestUrl(key) : "";

  let ciphertext = "";
  $: plaintext = context && key && ciphertext ? decrypt(context, key, ciphertext) : "";

  async function generateRequest() {
    context = await createContext();
    key = KeyPair.generate(context);
    ciphertext = "";
  }

  function buildRequestUrl(key: KeyPair) {
    const p = new URLSearchParams(key.toStringPublicKey());
    return `${window.origin}/#${p}`;
  }

  function decrypt(context: Context, key: KeyPair, ciphertext: string) {
    try {
      const reconstructedBox = SealedBox.fromBase64(context, ciphertext);
      return reconstructedBox.open(context, key, "text");
    } catch (err) {
      return "Unable to decrypt";
    }
  }

  onMount(generateRequest);
</script>

<div class="container">
  <div class="row">
    <div class="col">
      <h2>Create request</h2>
      {#if serializedKey}
        <div class="container">
          <div class="row">
            <div class="col">
              <label for="keyType">Key type </label>
            </div>
            <div class="col">
              <input readonly name="keyType" value={serializedKey.keyType} />
            </div>
          </div>
          <div class="row">
            <div class="col">
              <label for="keyType">Public key</label>
            </div>
            <div class="col">
              <input readonly name="publicKey" value={serializedKey.publicKey} />
            </div>
          </div>
          <div class="row">
            <div class="col">
              <label for="keyType">Private key</label>
            </div>
            <div class="col">
              <input readonly name="privateKey" value={serializedKey.privateKey} />
            </div>
          </div>
          <div class="row">
            <div class="col">
              <label for="requestUrl">Request URL</label>
            </div>
            <div class="col">
              <input readonly name="requestUrl" value={requestUrl} /> <br />
              <button on:click={clipboardCopy.bind(undefined, requestUrl)}>Copy</button> <br />
              <a target="_blank" href={requestUrl}>Open in new window</a>
            </div>
          </div>
        </div>
      {/if}
    </div>
    <div class="col">
      <h2>Decrypt response</h2>
      <label
        >Ciphertext <br />
        <textarea rows="4" cols="50" value={ciphertext} on:input={(e) => (ciphertext = e.currentTarget.value)} />
      </label>
      <br />
      {#if plaintext}
        <label
          >Plaintext <br />
          <textarea rows="4" cols="50" readonly value={plaintext} />
        </label>
      {/if}
    </div>
  </div>
</div>
