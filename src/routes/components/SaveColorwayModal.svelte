<script lang="ts">
	import { DataStore } from "$lib/api";
	import { onMount, createEventDispatcher } from "svelte";
	import ModalHeaderClose from "$lib/components/ModalHeaderClose.svelte";

	import "bootstrap-icons/font/bootstrap-icons.scss";
	import PlusIcon from "$lib/components/PlusIcon.svelte";
	import { goto } from "$app/navigation";

	let customColorwayStores: { name: string; colorways: Colorway[] }[] = [];

	onMount(async function () {
		customColorwayStores = (await DataStore.get("customColorways")) as {
			name: string;
			colorways: Colorway[];
		}[];
	});

	export let open = false;

	const dispatch = createEventDispatcher();

	export let colorway: Colorway;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
{#if open}
	<div class="backdrop" on:click|self={() => (open = false)}>
		<dialog open class="modal">
			<div class="modal-content">
				<ModalHeaderClose
					modal_title="Save colorway to:"
					modal_open={{
						set: (e) => (open = e),
					}}
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
					<div
						class="source thin"
						on:click={() => goto("/devices/this/offline")}
					>
						<span class="title">
							<PlusIcon /> Create New...
						</span>
					</div>
				</div>
			</div>
		</dialog>
	</div>
{/if}

<style lang="scss">
	.icon {
		font-family: bootstrap-icons;
		text-decoration: none;
		color: #fff;
	}
	.modal-content {
		min-width: 500px;
	}
	.source {
		margin-bottom: 8px;
		&:last-of-type {
			margin-bottom: 0;
		}
	}
	.source.thin {
		padding: 8px 12px;
		cursor: pointer;
		transition: 0.2s ease;
		&:hover {
			background-color: #1a1a1a;
		}
	}
</style>
