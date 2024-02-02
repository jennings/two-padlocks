<script>
  import "../app.scss";
  import { page } from "$app/stores";

  const links = [
    {
      text: "Home",
      path: "/",
    },
    {
      text: "Demo",
      path: "/demo",
    },
  ];
</script>

<nav class="navbar navbar-expand-lg bg-body-tertiary">
  <div class="container">
    <a class="navbar-brand" href="/">Two Padlocks</a>
    <button
      class="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarSupportedContent"
      aria-controls="navbarSupportedContent"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        {#each links as link}
          <li class="nav-item">
            <a
              class="nav-link"
              href={link.path}
              class:active={$page.route.id === link.path}
              aria-current={$page.route.id === link.path}>{link.text}</a
            >
          </li>
        {/each}
      </ul>
    </div>
  </div>
</nav>
<div class="container">
  <slot />
</div>
