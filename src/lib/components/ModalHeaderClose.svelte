<script lang="ts">
	import { type Writable } from "svelte/store";
	import "bootstrap-icons/font/bootstrap-icons.scss";

	export let modal_open:
		| Writable<boolean>
		| { set: (value: boolean) => void };
	export let modal_title: string;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div>
	<h2 class="modal-header">{modal_title}</h2>
	<span on:click={() => modal_open.set(false)}>&#xF659;</span>
</div>

<style lang="scss">
	div {
		display: flex;
		justify-content: space-between;
	}
	span {
		font-family: bootstrap-icons;
		width: 1.25em;
		height: 1.25em;
		font-size: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}
</style>
