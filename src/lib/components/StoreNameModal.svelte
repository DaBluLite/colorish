<script lang="ts">
	import { DataStore } from "$lib/api";
	import { createEventDispatcher } from "svelte";

	export let sourceName = "";
	let nameError = "";
	const dispatch = createEventDispatcher();

	export let conflicting = false;
	export let open = false;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
{#if open}
	<div class="backdrop" on:click|self={() => (open = false)}>
		<dialog open class="modal">
			<div class="modal-content">
				<h2 class="modal-header">
					{conflicting
						? "Duplicate Store Name"
						: "Give this store a name"}
				</h2>
				{#if conflicting}
					<h3>
						A store with the same name already exists. Please give a
						different name to the imported store:
					</h3>
				{/if}
				<span class="sect-header"
					>Name: {#if nameError}<span class="error">{nameError}</span
						>{/if}</span
				>
				<input
					type="text"
					placeholder="Enter a valid name..."
					value={sourceName}
					on:input={(e) => (sourceName = e.currentTarget.value)}
				/>
			</div>
			<div class="modal-footer">
				<button class="button" on:click|self={() => (open = false)}
					>Cancel</button
				>
				<button
					class="button surface"
					on:click={async () => {
						nameError = "";
						if (
							(await DataStore.get("customColorways"))
								.map((store) => store.name)
								.includes(sourceName)
						) {
							nameError = "Error: Store name already exists";
							return;
						}
						dispatch("finish", {
							name: sourceName,
						});
						open = false;
						conflicting = false;
					}}>Finish</button
				>
			</div>
		</dialog>
	</div>
{/if}
