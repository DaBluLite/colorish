<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import { DataStore } from "$lib/api";
	import { defaultColorwaySource } from "../../../../constants";
	import PlusIcon from "$lib/components/PlusIcon.svelte";
	import DownloadIcon from "$lib/components/DownloadIcon.svelte";
	import DeleteIcon from "$lib/components/DeleteIcon.svelte";
	import CopyIcon from "$lib/components/CopyIcon.svelte";
	import AddOnlineStoreModal from "./components/AddOnlineStoreModal.svelte";
	import { addonlinesource_open } from "$lib/store";
	import StoreNameModal from "$lib/components/StoreNameModal.svelte";

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

	onDestroy(() => addonlinesource_open.set(false));
</script>

<button class="button" on:click={() => addonlinesource_open.set(true)}
	><PlusIcon /> Add...</button
>

<AddOnlineStoreModal
	on:finish={async ({ detail }) => {
		await DataStore.set("colorwaySourceFiles", [
			...(await DataStore.get("colorwaySourceFiles")),
			{ name: detail.name, url: detail.url },
		]);
		colorwaySourceFiles = [
			...(await DataStore.get("colorwaySourceFiles")),
			{ name: detail.name, url: detail.url },
		];
	}}
/>

<StoreNameModal
	bind:sourceName={createofflinesource_sourcename}
	on:finish={async ({ detail }) => {
		const res = await fetch(createofflinesource_sourceurl);
		const data = await res.json();
		DataStore.set("customColorways", [
			...(await DataStore.get("customColorways")),
			{
				name: createofflinesource_sourcename,
				colorways: data.colorways || [],
			},
		]);
	}}
	bind:open={createofflinesource_open}
/>

<div class="main">
	{#if !colorwaySourceFiles.length}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			class="source"
			on:click={async () => {
				DataStore.set("colorwaySourceFiles", [
					{ name: "Project Colorway", url: defaultColorwaySource },
					...(await DataStore.get("colorwaySourceFiles")).filter(
						(i) => i.name !== "Project Colorway"
					),
				]);
				colorwaySourceFiles = [
					{ name: "Project Colorway", url: defaultColorwaySource },
					...(await DataStore.get("colorwaySourceFiles")).filter(
						(i) => i.name !== "Project Colorway"
					),
				];
			}}
		>
			<PlusIcon width={24} height={24} />
			<span class="colorwaysSettings-colorwaySourceLabel">
				Add Project Colorway Source
			</span>
		</div>
	{/if}
	{#each colorwaySourceFiles as colorwaySourceFile, i}
		<div class="source">
			<div class="hoverRoll">
				<span class="title hoverRoll_normal">
					{colorwaySourceFile.name}
					{#if colorwaySourceFile.url === defaultColorwaySource}<div
							class="colorways-badge"
						>
							Built-In
						</div>{/if}
					{#if colorwaySourceFile.url === "https://raw.githubusercontent.com/DaBluLite/ProjectColorway/master/index.json"}
						<div class="colorways-badge">
							Built-In | Outdated
						</div>{/if}
				</span>
				<span class="hoverRoll_hovered">
					{colorwaySourceFile.url}
				</span>
			</div>
			<div class="flex" style="margin-left: auto; gap: 8px;">
				<button
					class="button surface"
					on:click={() => {
						navigator.clipboard.writeText(colorwaySourceFile.url);
					}}
				>
					<CopyIcon width={14} height={14} /> Copy URL
				</button>
				{#if colorwaySourceFile.url === "https://raw.githubusercontent.com/DaBluLite/ProjectColorway/master/index.json"}
					<button
						class="button surface"
						on:click={async () => {
							DataStore.set("colorwaySourceFiles", [
								{
									name: "Project Colorway",
									url: defaultColorwaySource,
								},
								...(
									await DataStore.get("colorwaySourceFiles")
								).filter((i) => i.name !== "Project Colorway"),
							]);
							colorwaySourceFiles = [
								{
									name: "Project Colorway",
									url: defaultColorwaySource,
								},
								...(
									await DataStore.get("colorwaySourceFiles")
								).filter((i) => i.name !== "Project Colorway"),
							];
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							x="0px"
							y="0px"
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<rect y="0" fill="none" width="24" height="24" />
							<path
								d="M6.351,6.351C7.824,4.871,9.828,4,12,4c4.411,0,8,3.589,8,8h2c0-5.515-4.486-10-10-10 C9.285,2,6.779,3.089,4.938,4.938L3,3v6h6L6.351,6.351z"
							/>
							<path
								d="M17.649,17.649C16.176,19.129,14.173,20,12,20c-4.411,0-8-3.589-8-8H2c0,5.515,4.486,10,10,10 c2.716,0,5.221-1.089,7.062-2.938L21,21v-6h-6L17.649,17.649z"
							/>
						</svg> Update source...
					</button>
				{/if}
				{#if colorwaySourceFile.url !== defaultColorwaySource && colorwaySourceFile.url !== "https://raw.githubusercontent.com/DaBluLite/ProjectColorway/master/index.json"}
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
					<button
						class="button surface"
						on:click={async () => {
							await DataStore.set(
								"colorwaySourceFiles",
								(
									await DataStore.get("colorwaySourceFiles")
								).filter((src, ii) => ii !== i)
							);
							colorwaySourceFiles = await DataStore.get(
								"colorwaySourceFiles"
							);
						}}
					>
						<DeleteIcon width={14} height={14} /> Remove
					</button>
				{/if}
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
