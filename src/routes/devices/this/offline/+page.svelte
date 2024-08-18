<script lang="ts">
	import { onMount } from "svelte";
	import { DataStore } from "$lib/api";
	import PlusIcon from "$lib/components/PlusIcon.svelte";
	import DownloadIcon from "$lib/components/DownloadIcon.svelte";
	import DeleteIcon from "$lib/components/DeleteIcon.svelte";
	import StoreNameModal from "$lib/components/StoreNameModal.svelte";
	import download from "./download";

	let customColorwayStores: { name: string; colorways: Colorway[] }[] = [];

	onMount(async function () {
		customColorwayStores = (await DataStore.get("customColorways")) as {
			name: string;
			colorways: Colorway[];
		}[];
	});

	let createofflinesource_open = false;
	let createofflinesource_sourcename = "";
</script>

<button
	class="button"
	on:click={() => (
		(createofflinesource_open = true), (createofflinesource_sourcename = "")
	)}><PlusIcon /> New...</button
>

<StoreNameModal
	bind:sourceName={createofflinesource_sourcename}
	on:finish={async ({ detail }) => {
		await DataStore.set("customColorways", [
			...(await DataStore.get("customColorways")),
			{ name: detail.name, colorways: [] },
		]);
		customColorwayStores = await DataStore.get("customColorways");
	}}
	bind:open={createofflinesource_open}
/>

<div class="main">
	{#each customColorwayStores as { name: customColorwaySourceName, colorways: offlineStoreColorways }}
		<div class="source">
			<span class="title">
				{customColorwaySourceName}
			</span>
			<div class="flex" style="margin-left: auto; gap: 8px;">
				<button
					class="button surface"
					on:click={() => {
						const blob = new Blob(
							[
								JSON.stringify({
									name: customColorwaySourceName,
									colorways: [...offlineStoreColorways],
								}),
							],
							{ type: "application/json" }
						);
						const url = URL.createObjectURL(blob);
						download(
							url,
							`${customColorwaySourceName
								.replaceAll(" ", "-")
								.toLowerCase()}.colorways.json`
						);
					}}
				>
					<DownloadIcon width={14} height={14} /> Export as...
				</button>
				<button
					class="button surface"
					on:click={async () => {
						var sourcesArr = [];
						const customColorwaySources = await DataStore.get(
							"customColorways"
						);
						customColorwaySources.map((source) => {
							if (source.name !== customColorwaySourceName) {
								sourcesArr.push(source);
							}
						});
						DataStore.set("customColorways", sourcesArr);
						customColorwayStores = sourcesArr;
					}}
				>
					<DeleteIcon width={14} height={14} /> Remove
				</button>
			</div>
		</div>
	{/each}
</div>

<style lang="scss">
	span {
		color: #fff;
	}
	.main {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.colorways-badge {
		font-size: 0.625rem;
		text-transform: uppercase;
		vertical-align: top;
		display: inline-flex;
		align-items: center;
		text-indent: 0;
		background: #fff;
		color: #000;
		flex: 0 0 auto;
		height: 15px;
		padding: 0 4px;
		margin-top: 7.5px;
		border-radius: 16px;
	}
</style>
