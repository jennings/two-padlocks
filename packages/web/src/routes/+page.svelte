<script lang="ts">
  import { onMount } from "svelte";
  import type { Context } from "$lib/encryption";
  import { PublicKey, SealedBox, createContext } from "$lib/encryption";

  type Loadable<T> =
    | { state: "loading" }
    | { state: "ready"; value: T }
    | { state: "error"; error: unknown };

  let plaintext = "";
  let ciphertext: string | null = "";
  type ReadyData = { context: Context; publicKey: PublicKey };
  let data: Loadable<ReadyData> = { state: "loading" };
  let recipient: string | null;

  async function seal(context: Context, key: PublicKey) {
    const box = await SealedBox.seal(context, plaintext, key);
    ciphertext = box.toString();
  }

  onMount(async () => {
    const { hash } = window.location;
    const params = new URLSearchParams(hash);
    const publicKey = params.get("publicKey");
    const keyType = params.get("keyType");
    recipient = params.get("recipient");

    if (publicKey == null || keyType == null) {
      const missingNames = [publicKey && "publicKey", keyType && "keyType"]
        .filter(Boolean)
        .join(",");
      data = { state: "error", error: new Error(`Missing ${missingNames} from hash`) };
    } else {
      try {
        const context = await createContext();
        const pk = PublicKey.fromStringPublicKey(context, { keyType, publicKey });
        data = {
          state: "ready",
          value: {
            context,
            publicKey: pk,
          },
        };
      } catch (error) {
        data = { state: "error", error };
      }
    }
  });
</script>

{#if data.state === "ready"}
  <div class="container">
    <p>
      Encrypt a secret{#if recipient}
        to {recipient}{/if}.
    </p>
    <textarea value={plaintext} on:input={(e) => (plaintext = e.currentTarget.value)} />
    <button on:click={seal.bind(undefined, data.value.context, data.value.publicKey)}>
      Encrypt
    </button>

    {#if ciphertext != null}
      <textarea readonly value={ciphertext} />
    {/if}
  </div>
{:else}
  <p>
    Two Padlocks is a tool to request an secret. You should receive a link to this page which will
    let you encrypt a secret.
  </p>
  {#if data.state === "error"}
    <p>
      Load error: {data.error}
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
