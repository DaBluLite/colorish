<script lang="ts">
	import { boundClients } from "$lib/store";
	import download from "../../this/offline/download";
	import DownloadIcon from "$lib/components/DownloadIcon.svelte";
	import { DataStore } from "$lib/api";
	import { onMount } from "svelte";
	import StoreNameModal from "$lib/components/StoreNameModal.svelte";
	import { page } from "$app/stores";

	let colorwaySourceFiles: { name: string; url: string }[] = [];
	let customColorwayStores: { name: string; colorways: Colorway[] }[] = [];

	let createofflinesource_sourcename = "";
	let createofflinesource_colorways: Colorway[] = [];
	let createofflinesource_open = false;

	onMount(async function () {
		colorwaySourceFiles = (await DataStore.get("colorwaySourceFiles")) as {
			name: string;
			url: string;
		}[];
		customColorwayStores = (await DataStore.get("customColorways")) as {
			name: string;
			colorways: Colorway[];
		}[];
	});
</script>

<StoreNameModal
	bind:sourceName={createofflinesource_sourcename}
	on:finish={async ({ detail }) => {
		await DataStore.set("customColorways", [
			...(await DataStore.get("customColorways")),
			{
				name: createofflinesource_sourcename,
				colorways: createofflinesource_colorways || [],
			},
		]);
		customColorwayStores = await DataStore.get("customColorways");
	}}
	bind:open={createofflinesource_open}
/>

{#if !$boundClients[$page.params.boundClientKey].offline && !$boundClients[$page.params.boundClientKey].online}
	<span
		>How did you even get here, this bound client has no shared sources</span
	>
{:else}
	<div class="main">
		{#each $boundClients[$page.params.boundClientKey].offline as { name: customColorwaySourceName, colorways: offlineStoreColorways }}
			<div class="source">
				<span class="title">
					{customColorwaySourceName}
				</span>
				<div class="flex" style="margin-left: auto; gap: 8px;">
					<button
						class="button surface"
						on:click={async () => {
							createofflinesource_sourcename =
								customColorwaySourceName;
							createofflinesource_colorways =
								offlineStoreColorways;
							createofflinesource_open = true;
						}}
					>
						<DownloadIcon width={14} height={14} /> Download...
					</button>
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
{/if}
