<script lang="ts">
	import { DataStore } from "$lib/api";
	import PlusIcon from "$lib/components/PlusIcon.svelte";
	import RefreshIcon from "$lib/components/RefreshIcon.svelte";
	import { onMount } from "svelte";
	import { nullColorwayObj } from "../constants";
	import FiltersMenu from "./components/FiltersMenu.svelte";
	import { colorToHex, stringToHex } from "$lib/utils/utils";
	import DeleteIcon from "$lib/components/DeleteIcon.svelte";
	import CodeIcon from "$lib/components/CodeIcon.svelte";
	import IDIcon from "$lib/components/IDIcon.svelte";
	import SourcesMenu from "./components/SourcesMenu.svelte";
	import { boundClients } from "$lib/store";
	import { writable } from "svelte/store";

	let searchValue: string = "";
	let colorwayData: SourceObject[] = [];
	let sortBy: SortOptions = 1;
	const activeColorwayObject = writable(nullColorwayObj);
	const customColorwayData = writable([] as SourceObject[]);
	let loaderHeight: "2px" | "0px" = "2px";
	let visibleSources: string = "all";

	function setCustomColorwayData(customColorways: SourceObject[]) {
		customColorwayData.set(customColorways);
	}

	function setActiveColorwayObject(obj: ColorwayObject) {
		activeColorwayObject.set(obj);
	}

	let filters: {
		name: string;
		id: string;
		sources: SourceObject[];
	}[] = [
		{
			name: "All",
			id: "all",
			sources: [...colorwayData, ...$customColorwayData],
		},
		...colorwayData.map((source) => ({
			name: source.source,
			id: source.source.toLowerCase().replaceAll(" ", "-"),
			sources: [source],
		})),
		...$customColorwayData.map((source) => ({
			name: source.source,
			id: source.source.toLowerCase().replaceAll(" ", "-"),
			sources: [source],
		})),
	];

	async function loadUI(force?: boolean) {
		activeColorwayObject.set(
			(await DataStore.get("activeColorwayObject")) as ColorwayObject
		);
		loaderHeight = "0px";

		$customColorwayData = [
			...(
				(await DataStore.get("customColorways")) as {
					name: string;
					colorways: Colorway[];
					id?: string;
				}[]
			).map(
				(colorSrc: {
					name: string;
					colorways: Colorway[];
					id?: string;
				}) => ({
					type: "offline" as SourceType,
					source: colorSrc.name,
					colorways: colorSrc.colorways,
				})
			),
			...Object.values($boundClients)
				.map((cl) =>
					cl.offline
						? cl.offline.map((source) => ({
								type: "complication:offline" as SourceType,
								source: `${
									Object.values(JSON.parse(cl.boundKey))[0]
								}: ${source.name}`,
								colorways: source.colorways,
						  }))
						: []
				)
				.flat(2),
		];

		const onlineSources: { name: string; url: string }[] =
			(await DataStore.get("colorwaySourceFiles")) as {
				name: string;
				url: string;
			}[];

		let localOnlineSources = onlineSources.map(
			({ url }: { url: string }) => url
		);

		const onlineComplSources: { name: string; url: string }[] =
			Object.values($boundClients)
				.map((cl) => {
					if (cl.online) {
						const srcs = cl.online
							.filter(
								({ url }) => !localOnlineSources.includes(url)
							)
							.map((source) => ({
								name: `${
									Object.values(JSON.parse(cl.boundKey))[0]
								}: ${source.name}`,
								url: source.url,
							}));

						localOnlineSources = [
							...localOnlineSources,
							...cl.online
								.filter(
									({ url }) =>
										!localOnlineSources.includes(url)
								)
								.map(({ url }) => url),
						];
						return srcs;
					} else return [];
				})
				.flat(2) as {
				name: string;
				url: string;
			}[];

		const responses: Response[] = await Promise.all(
			onlineSources.map(({ url }: { url: string }) =>
				fetch(url, force ? { cache: "no-store" } : {})
			)
		);

		const complicationResponses: Response[] = await Promise.all(
			onlineComplSources.map(({ url }: { url: string }) =>
				fetch(url, force ? { cache: "no-store" } : {})
			)
		);

		colorwayData = (await Promise.all([
			...responses
				.map((res, i) => ({
					response: res,
					name: onlineSources[i].name,
				}))
				.map((res: { response: Response; name: string }) =>
					res.response
						.json()
						.then((dt) => ({
							colorways: dt.colorways as Colorway[],
							source: res.name,
							type: "online",
						}))
						.catch(() => ({
							colorways: [] as Colorway[],
							source: res.name,
							type: "online",
						}))
				),
			...complicationResponses
				.map((res, i) => ({
					response: res,
					name: onlineComplSources[i].name,
				}))
				.map((res: { response: Response; name: string }) =>
					res.response
						.json()
						.then((dt) => ({
							colorways: dt.colorways as Colorway[],
							source: res.name,
							type: "complication:online",
						}))
						.catch(() => ({
							colorways: [] as Colorway[],
							source: res.name,
							type: "complication:online",
						}))
				),
		])) as {
			type: SourceType;
			source: string;
			colorways: Colorway[];
		}[];

		filters = [
			{
				name: "All",
				id: "all",
				sources: [...colorwayData, ...$customColorwayData],
			},
			...colorwayData.map((source) => ({
				name: source.source,
				id: source.source.toLowerCase().replaceAll(" ", "-"),
				sources: [source],
			})),
			...$customColorwayData.map((source) => ({
				name: source.source,
				id: source.source.toLowerCase().replaceAll(" ", "-"),
				sources: [source],
			})),
		];
	}

	window.electron.receive("update-bound-clients", loadUI);

	window.electron.receive(
		"complication:manager-role:receive-colorway",
		(color) => {
			if (
				$activeColorwayObject.id === color.name &&
				$activeColorwayObject.source === color.source
			) {
				activeColorwayObject.set(nullColorwayObj);
			} else {
				activeColorwayObject.set(color);
			}
		}
	);

	onMount(() => loadUI());
</script>

<input
	type="text"
	placeholder="Search for a colorway..."
	value={searchValue}
	on:input={(e) => (searchValue = e.currentTarget.value)}
/>

<div style="display: flex; gap: 8px;">
	<button
		class="button"
		on:click={() => {
			loaderHeight = "2px";
			loadUI();
		}}><RefreshIcon /> Refresh</button
	>
	<a class="button" href="/creator"><PlusIcon /> Create</a>
	<FiltersMenu
		bind:sort={sortBy}
		on:sortchange={({ detail: sort }) => {
			sortBy = sort;
		}}
	/>
	<SourcesMenu
		source={filters.filter((filter) => filter.id == visibleSources)[0]}
		sources={filters}
		on:sourcechange={({ detail: { id } }) => {
			visibleSources = id;
		}}
	/>
</div>

<div class="selector">
	{#if filters.map((filter) => filter.id).includes(visibleSources)}
		{#each filters
			.filter((filter) => filter.id === visibleSources)[0]
			.sources.map( ({ colorways, source, type }) => colorways.map( (colorway) => ({ ...colorway, sourceType: type, source: source, preset: colorway.preset || (colorway.isGradient ? "Gradient" : "Default") }) ) )
			.flat()
			.sort((a, b) => {
				switch (sortBy) {
					case 1:
						return a.name.localeCompare(b.name);
					case 2:
						return b.name.localeCompare(a.name);
					case 3:
						return a.source.localeCompare(b.source);
					case 4:
						return b.source.localeCompare(a.source);
					default:
						return a.name.localeCompare(b.name);
				}
			})
			.map( (color) => (color.colors ? color : { ...color, colors: ["accent", "primary", "secondary", "tertiary"] }) )
			.map((color) => {
				const colors = {};
				color.colors?.map((colorStr) => (colors[colorStr] = colorToHex(color[colorStr])));
				return { ...color, colorObj: colors };
			}) as color}
			{#if color.name.toLowerCase().includes(searchValue.toLowerCase())}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div
					class="colorway"
					id={"colorway-" + color.name}
					aria-checked={$activeColorwayObject.id === color.name &&
						$activeColorwayObject.source === color.source}
					on:click|self={async () => {
						if (
							$activeColorwayObject.id === color.name &&
							$activeColorwayObject.source === color.source
						) {
							DataStore.set(
								"activeColorwayObject",
								nullColorwayObj
							);
							activeColorwayObject.set(nullColorwayObj);
							window.electron.send("colorway-removed");
						} else {
							const newObj = {
								id: color.name,
								sourceType: color.sourceType,
								source: color.source,
								colors: color.colorObj,
							};
							activeColorwayObject.set(newObj);
							DataStore.set("activeColorwayObject", newObj);
							window.electron.send("colorway-updated", {
								activeColorwayObject: newObj,
							});
						}
					}}
				>
					<div class="colorwayColors">
						{#if !color.isGradient}
							{#each Object.values(color.colorObj) as colorStr}
								<div
									class="color"
									style={`background-color: #${colorToHex(
										colorStr
									)}`}
								/>
							{/each}
						{:else}
							<div
								class="color"
								style={`background: linear-gradient(${color.linearGradient})`}
							/>
						{/if}
					</div>
					<span class="label">{color.name}</span>
					<button
						class="button surface"
						on:click={(e) => {
							// openModal((props) => <InfoModal
							//     modalProps={props}
							//     colorway={color}
							//     loadUIProps={loadUI}
							// />);
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							fill="currentColor"
							viewBox="0 0 16 16"
						>
							<path
								d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"
							/>
						</svg>
					</button>
					<button
						class="button surface"
						on:click={async () => {
							navigator.clipboard.writeText(color["dc-import"]);
						}}
					>
						<CodeIcon width={20} height={20} />
					</button>
					<button
						class="button surface"
						on:click={async () => {
							const colorwayIDArray = `${color.accent},${
								color.primary
							},${color.secondary},${color.tertiary}|n:${
								color.name
							}${color.preset ? `|p:${color.preset}` : ""}`;
							const colorwayID = stringToHex(colorwayIDArray);
							navigator.clipboard.writeText(colorwayID);
						}}
					>
						<IDIcon width={20} height={20} />
					</button>
					{#if color.sourceType === "offline"}
						<button
							class="button surface"
							on:click={async () => {
								const oldStores = (
									await DataStore.get("customColorways")
								).filter(
									(sourcee) => sourcee.name !== color.source
								);
								const storeToModify = (
									await DataStore.get("customColorways")
								).filter(
									(sourcee) => sourcee.name === color.source
								)[0];
								const newStore = {
									name: storeToModify.name,
									colorways: storeToModify.colorways.filter(
										(colorway) =>
											colorway.name !== color.name
									),
								};
								DataStore.set("customColorways", [
									...oldStores,
									newStore,
								]);
								setCustomColorwayData(
									[...oldStores, newStore].map(
										(colorSrc) => ({
											type: "offline",
											source: colorSrc.name,
											colorways: colorSrc.colorways,
										})
									)
								);
								if (
									(
										await DataStore.get(
											"activeColorwayObject"
										)
									).id === color.name
								) {
									DataStore.set(
										"activeColorwayObject",
										nullColorwayObj
									);
									setActiveColorwayObject(nullColorwayObj);
								}
								loadUI();
							}}
						>
							<DeleteIcon width={20} height={20} />
						</button>
					{/if}
				</div>
			{/if}
		{/each}
	{/if}
</div>

<style lang="scss">
	:root {
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
			Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
	}
	.selector {
		padding: 0;
		overflow: hidden auto;
		display: flex;
		flex-direction: column;
		gap: 8px;
		width: 100%;
		height: calc(100% - 8px);
		scrollbar-width: none !important;
		&::-webkit-scrollbar {
			width: 0;
		}
		& > .colorway {
			display: flex;
			flex-direction: row;
			justify-content: start;
			padding: 0 8px;
			gap: 5px;
			border-radius: 6px;
			background-color: #101010;
			box-sizing: border-box;
			min-height: 44px;
			align-items: center;
			border: 1px solid transparent;
			transition: 0.2s ease;
			cursor: pointer;
			color: #dfdfdf;
			&:hover {
				background-color: #2a2a2a;
			}
			&[aria-checked="true"] {
				background-color: #2a2a2a;
				border-color: #a6a6a6;
			}
			& .label {
				margin-right: auto;
				margin-left: 0.5rem;
			}
			& > .colorwayColors {
				display: flex;
				flex-flow: wrap;
				flex-direction: row;
				overflow: hidden;
				border-radius: 50%;
				width: 30px;
				height: 30px;
				box-shadow: 0 0 0 1.5px #a6a6a6;
				box-sizing: border-box;
				& > .color {
					width: 50%;
					height: 50%;
				}
				&:not(:has(> .color:nth-child(2))) > .color {
					width: 100%;
					height: 100%;
				}
				&:not(:has(> .color:nth-child(3))) > .color {
					height: 100%;
				}
				&:not(:has(> .color:nth-child(4))) > .color:nth-child(3) {
					width: 100%;
				}
			}
		}
	}
</style>
