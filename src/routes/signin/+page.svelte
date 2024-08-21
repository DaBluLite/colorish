<script lang="ts">
	import { goto } from "$app/navigation";
	import { DataStore } from "$lib/api";
	import "bootstrap-icons/font/bootstrap-icons.scss";

	let username = "";
</script>

<div class="wrap">
	<h2 class="modal-header">
		<a href="/" class="icon">&#xF12F;</a>Create a Username:
	</h2>
	<span class="sect-header"
		>You need a username to create colorways. This username will not be
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		retained when submitting colorways through the
		<span
			style="text-decoration: underline;"
			on:click={() =>
				window.electron.openExtenralPage(
					"https://dablulite.vercel.app/protected/projectcolorway/submit"
				)}>Project Hub</span
		></span
	>
	<span class="sect-header">Name:</span>
	<input
		type="text"
		placeholder="Enter a valid Username..."
		bind:value={username}
	/>
	<button
		class="button"
		on:click={() =>
			DataStore.set("Username", username).then(() => {
				goto("/creator");
			})}
	>
		Set Username
	</button>
</div>

<style lang="scss">
	.icon {
		font-family: bootstrap-icons;
		text-decoration: none;
		color: #fff;
	}
	.wrap {
		display: flex;
		flex-direction: column;
		width: 50%;
		gap: 8px;
	}
	.modal-header {
		display: flex;
		align-items: center;
		gap: 8px;
		color: #fff;
	}
</style>
