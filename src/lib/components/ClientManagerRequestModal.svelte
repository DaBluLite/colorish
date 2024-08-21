<script lang="ts">
	import { getClientDisplayName } from "$lib/utils/utils";
	import ModalHeaderClose from "./ModalHeaderClose.svelte";

	export let boundKey: { [managerID: string]: string };

	export let open: boolean;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
{#if open}
	<div class="backdrop" on:click|self={() => (open = false)}>
		<dialog open class="modal">
			<div class="modal-content">
				<ModalHeaderClose
					modal_title="Manager Access Request"
					modal_open={{ set: (value) => (open = value) }}
				/>
				<span
					>{getClientDisplayName(Object.values(boundKey)[0])} has requested
					manager access. This will allow this app to change colorways
					to all connected clients.</span
				>
			</div>
			<div class="modal-footer">
				<button class="button" on:click={() => (open = false)}
					>Reject</button
				>
				<button
					class="button surface"
					on:click={() => {
						open = false;
						window.electron.send(
							"complication:manager-role:manager-updated",
							boundKey
						);
					}}>Accept</button
				>
				<button
					class="button surface"
					on:click={() => {
						open = false;
						window.electron.send(
							"complication:manager-role:manager-updated",
							boundKey
						);
						setTimeout(() => {
							window.electron.send("sendToWsClient", {
								boundKey: boundKey,
								type: "complication:manager-role:revoked",
							});
						}, 300000);
					}}>Accept for 5mins</button
				>
			</div>
		</dialog>
	</div>
{/if}

<style lang="scss">
	.modal-content {
		min-width: 400px;
	}
	.modal {
		max-width: 500px;
	}
</style>
