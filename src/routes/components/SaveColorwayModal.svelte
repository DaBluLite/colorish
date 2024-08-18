<script lang="ts">
	import { DataStore } from "$lib/api";
	import { savecolorwaymodal_open } from "$lib/store";
	import { onMount, onDestroy, createEventDispatcher } from "svelte";
	import ModalHeaderClose from "$lib/components/ModalHeaderClose.svelte";

	let customColorwayStores: { name: string; colorways: Colorway[] }[] = [];

	onMount(async function () {
		customColorwayStores = (await DataStore.get("customColorways")) as {
			name: string;
			colorways: Colorway[];
		}[];
	});

	onDestroy(() => savecolorwaymodal_open.set(false));

	const dispatch = createEventDispatcher();

	export let colorway: Colorway;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
{#if $savecolorwaymodal_open}
	<div
		class="backdrop"
		on:click|self={() => savecolorwaymodal_open.set(false)}
	>
		<dialog open class="modal">
			<div class="modal-content">
				<ModalHeaderClose
					modal_title="Save colorway:"
					modal_open={savecolorwaymodal_open}
				/>
				<div>
					{#each customColorwayStores as { name: customColorwaySourceName, colorways: offlineStoreColorways }}
						<div class="source">
							<span class="title">
								{customColorwaySourceName}
							</span>
							<div
								class="flex"
								style="margin-left: auto; gap: 8px;"
							>
								{#if !offlineStoreColorways
									.map((c) => c.name)
									.includes(colorway.name)}
									<button
										class="button surface"
										on:click={async () => {
											dispatch("finish");
											var sourcesArr = [
												{
													name: customColorwaySourceName,
													colorways: [
														colorway,
														...offlineStoreColorways,
													],
												},
											];
											const customColorwaySources =
												await DataStore.get(
													"customColorways"
												);
											customColorwaySources.map(
												(source) => {
													if (
														source.name !==
														customColorwaySourceName
													) {
														sourcesArr.push(source);
													}
												}
											);
											DataStore.set(
												"customColorways",
												sourcesArr
											);
											customColorwayStores = sourcesArr;
										}}
									>
										Save Here
									</button>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>
		</dialog>
	</div>
{/if}

<style lang="scss">
	.modal-content {
		min-width: 500px;
	}
</style>
