<script lang="ts">
	import { DataStore } from "$lib/api";
	import { addonlinesource_open } from "$lib/store";
	import { createEventDispatcher } from "svelte";

	let sourceURL = "";
	let sourceName = "";
	let nameError = "";
	let URLError = "";
	const dispatch = createEventDispatcher();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
{#if $addonlinesource_open}
	<div class="backdrop" on:click|self={() => addonlinesource_open.set(false)}>
		<dialog open class="modal">
			<div class="modal-content">
				<h2 class="modal-header">Add a source:</h2>
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
				<span class="sect-header"
					>URL: {#if URLError}<span class="error">{URLError}</span
						>{/if}</span
				>
				<input
					type="text"
					placeholder="Enter a valid URL..."
					value={sourceURL}
					on:input={(e) => (sourceURL = e.currentTarget.value)}
				/>
			</div>
			<div class="modal-footer">
				<button
					class="button"
					on:click|self={() => {
						addonlinesource_open.set(false);
					}}>Cancel</button
				>
				<button
					class="button surface"
					on:click={async () => {
						const sourcesArr = await DataStore.get(
							"colorwaySourceFiles"
						);
						nameError = "";
						URLError = "";
						if (!sourceName) {
							nameError = "Error: Please enter a valid name";
						} else if (!sourceURL) {
							URLError = "Error: Please enter a valid URL";
						} else if (
							sourcesArr.map((s) => s.name).includes(sourceName)
						) {
							nameError =
								"Error: An online source with that name already exists";
						} else if (
							sourcesArr.map((s) => s.url).includes(sourceURL)
						) {
							URLError =
								"Error: An online source with that url already exists";
						} else {
							dispatch("finish", {
								name: sourceName,
								url: sourceURL,
							});
							addonlinesource_open.set(false);
						}
					}}>Finish</button
				>
			</div>
		</dialog>
	</div>
{/if}
