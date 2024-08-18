<script lang="ts">
	import ModalHeaderClose from "./ModalHeaderClose.svelte";

	export let colorway: Colorway;

	export let open: boolean;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
{#if open}
	<div class="backdrop" on:click|self={() => (open = false)}>
		<dialog open class="modal">
			<div class="modal-content">
				<ModalHeaderClose
					modal_title={`Manager: ${colorway.name}`}
					modal_open={{ set: (value) => (open = value) }}
				/>
				<span class="sect-header">Creator:</span>
			</div>
		</dialog>
	</div>
{/if}

<style lang="scss">
	.modal-content {
		min-width: 400px;
	}
</style>
