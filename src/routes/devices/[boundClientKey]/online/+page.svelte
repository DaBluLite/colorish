<script lang="ts">
	import { page } from "$app/stores";
	import { boundClients } from "$lib/store";
	import { redirect } from "@sveltejs/kit";
	import DownloadIcon from "$lib/components/DownloadIcon.svelte";
	import CopyIcon from "$lib/components/CopyIcon.svelte";
	import { DataStore } from "$lib/api";
	import { onMount } from "svelte";
	import StoreNameModal from "$lib/components/StoreNameModal.svelte";
	import { defaultColorwaySource } from "../../../../constants";

	const boundClientKey: string = $page.params.boundClientKey;

	let colorwaySourceFiles: { name: string; url: string }[] = [];
	let customColorwayStores: { name: string; colorways: Colorway[] }[] = [];

	let createofflinesource_sourcename = "";
	let createofflinesource_sourceurl = "";
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
		const res = await fetch(createofflinesource_sourceurl);
		const data = await res.json();
		await DataStore.set("customColorways", [
			...(await DataStore.get("customColorways")),
			{
				name: createofflinesource_sourcename,
				colorways: data.colorways || [],
			},
		]);
		customColorwayStores = await DataStore.get("customColorways");
	}}
	bind:open={createofflinesource_open}
/>

{#if !$boundClients[boundClientKey].offline && !$boundClients[boundClientKey].online}
	<span
		>How did you even get here, this bound client has no shared sources</span
	>
{:else}
	<div class="main">
		{#each $boundClients[boundClientKey].online as colorwaySourceFile, i}
			<div class="source">
				<div class="hoverRoll">
					<span class="title hoverRoll_normal">
						{colorwaySourceFile.name}
					</span>
					<span class="hoverRoll_hovered">
						{colorwaySourceFile.url}
					</span>
				</div>
				<div class="flex" style="margin-left: auto; gap: 8px;">
					{#if colorwaySourceFile.url !== defaultColorwaySource}
						<button
							class="button surface"
							on:click={async () => {
								createofflinesource_sourcename =
									colorwaySourceFile.name;
								createofflinesource_sourceurl =
									colorwaySourceFile.url;
								createofflinesource_open = true;
							}}
						>
							<DownloadIcon width={14} height={14} /> Download...
						</button>
					{/if}
					{#if colorwaySourceFile.url !== defaultColorwaySource && !colorwaySourceFiles
							.map((colorsrc) => colorsrc.url)
							.includes(colorwaySourceFile.url)}
						<button
							class="button surface"
							on:click={async () => {
								await DataStore.set("colorwaySourceFiles", [
									...(await DataStore.get(
										"colorwaySourceFiles"
									)),
									{ ...colorwaySourceFile },
								]);
								colorwaySourceFiles = await DataStore.get(
									"colorwaySourceFiles"
								);
							}}
						>
							<DownloadIcon width={14} height={14} /> Import
						</button>
					{/if}
					<button
						class="button surface"
						on:click={() => {
							navigator.clipboard.writeText(
								colorwaySourceFile.url
							);
						}}
					>
						<CopyIcon width={14} height={14} /> Copy URL
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
