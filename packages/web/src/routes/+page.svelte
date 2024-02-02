<script lang="ts">
  import { onMount } from "svelte";
  import { SealedBox, PublicKey } from "two-padlocks-core/crypto";

  type Loadable<T> =
    | { state: "loading" }
    | { state: "ready"; value: T }
    | { state: "error"; error: unknown };

  let plaintext = "";
  let ciphertext: string | null = "";
  let key: Loadable<PublicKey> = { state: "loading" };
  let recipient: string | null;

  async function seal(key: PublicKey) {
    const box = await SealedBox.seal(plaintext, key);
    ciphertext = box.toString();
  }

  onMount(() => {
    const { hash } = window.location;
    const params = new URLSearchParams(hash);
    const publicKey = params.get("publicKey");
    const keyType = params.get("keyType");
    recipient = params.get("recipient");

    if (publicKey == null || keyType == null) {
      const missingNames = [publicKey && "publicKey", keyType && "keyType"]
        .filter(Boolean)
        .join(",");
      key = { state: "error", error: new Error(`Missing ${missingNames} from hash`) };
    } else {
      key = { state: "ready", value: PublicKey.fromStringPublicKey({ keyType, publicKey }) };
    }
  });
</script>

{#if key.state === "ready"}
  <div class="container">
    <p>
      Encrypt a secret{#if recipient}
        to {recipient}{/if}.
    </p>
    <textarea value={plaintext} on:input={(e) => (plaintext = e.currentTarget.value)} />
    <button on:click={seal.bind(undefined, key.value)}>Encrypt</button>

    {#if ciphertext != null}
      <textarea readonly value={ciphertext} />
    {/if}
  </div>
{:else}
  <p>
    Two Padlocks is a tool to request an secret. You should receive a link to this page which will
    let you encrypt a secret.
  </p>
  {#if key.state === "error"}
    <p>
      Load error: {key.error}
    </p>
  {/if}
{/if}

<style>
  .container {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
</style>
