<script lang="ts">
	import { signIn } from "@auth/sveltekit/client";

	export let data;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore missing-declaration -->
<!-- svelte-ignore a11y-missing-attribute -->

<div>
	{#if !Object.keys(data.session || {}).length}
		Please sign in to access this page <a
			class="button"
			on:click={() => signIn("discord")}
			style="width: fit-content; display: inline-flex"
			>Sign in using Discord</a
		>
	{:else}
		You're signed in. You can now close this tab
	{/if}
</div>

<style lang="scss">
	:global(.dragbar),
	:global(.global_nav) {
		display: none !important;
	}
	div {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: #fff;
		font-size: 20px;
		font-weight: bold;
		display: inline-block;
		width: max-content;
		font-family: Comfortaa;
	}
</style>
