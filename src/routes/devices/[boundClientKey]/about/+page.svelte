<script lang="ts">
	import { boundClients } from "$lib/store";
	import { getClientDisplayName } from "$lib/utils/utils";
	import { onMount } from "svelte";
	import { page } from "$app/stores";

	let noOfColors = "Loading...";

	onMount(async () => {
		async function getColorwayLenght() {
			async function getOnline() {
				const onlineComplSources: { name: string; url: string }[] =
					Object.values($boundClients)
						.map((cl) => {
							if (cl.online) {
								return cl.online.map((source) => ({
									name: `${
										Object.values(
											JSON.parse(cl.boundKey)
										)[0]
									}: ${source.name}`,
									url: source.url,
								}));
							} else return [];
						})
						.flat(2) as {
						name: string;
						url: string;
					}[];

				const complicationResponses: Response[] = await Promise.all(
					onlineComplSources.map(({ url }: { url: string }) =>
						fetch(url)
					)
				);

				const colorwayData = (await Promise.all([
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

				return colorwayData;
			}

			function getOffline() {
				return Object.values($boundClients)
					.map((cl) =>
						cl.offline
							? cl.offline.map((source) => ({
									type: "complication:offline" as SourceType,
									source: `${
										Object.values(
											JSON.parse(cl.boundKey)
										)[0]
									}: ${source.name}`,
									colorways: source.colorways,
							  }))
							: []
					)
					.flat(2);
			}

			return [
				...($boundClients[$page.params.boundClientKey] &&
				$boundClients[$page.params.boundClientKey].online
					? (await getOnline()).flatMap(({ colorways }) => colorways)
					: []),
				...($boundClients[$page.params.boundClientKey] &&
				$boundClients[$page.params.boundClientKey].offline
					? getOffline().flatMap(({ colorways }) => colorways)
					: []),
			].length;
		}

		window.electron.receive("update-bound-clients", () => {
			getColorwayLenght();
		});

		noOfColors = String(await getColorwayLenght());
	});
</script>

<div>
	<div>
		{#if $boundClients[$page.params.boundClientKey].complications?.includes("manager-role")}
			<button
				class="button"
				on:click={() => {
					window.electron.sendToClient({
						type: $boundClients[$page.params.boundClientKey]
							.isManager
							? "complication:manager-role:revoked"
							: "complication:manager-role:granted",
						boundKey: $page.params.boundClientKey,
					});
				}}
			>
				{$boundClients[$page.params.boundClientKey] &&
				($boundClients[$page.params.boundClientKey].isManager || false)
					? "Revoke"
					: "Grant"} Manager Role
			</button>
		{/if}
		<button
			class="button"
			on:click={() =>
				navigator.clipboard.writeText($page.params.boundClientKey)}
		>
			Copy Bound Key
		</button>
		{#if $boundClients[$page.params.boundClientKey].complications?.includes("remote-sources")}
			<button
				class="button"
				on:click={() =>
					window.electron.sendToClient({
						type: "complication:remote-sources:update-request",
						boundKey: $page.params.boundClientKey,
					})}
			>
				Request Source Update
			</button>
		{/if}
		{#if $boundClients[$page.params.boundClientKey].complications?.includes("ui-summon")}
			<button
				class="button"
				on:click={() =>
					window.electron.sendToClient({
						type: "complication:ui-summon:summon",
						boundKey: $page.params.boundClientKey,
					})}
			>
				Open Client UI
			</button>
		{/if}
	</div>
	<span class="head">Program Identifier:</span>
	<span class="itm"
		>{getClientDisplayName(
			Object.values(JSON.parse($page.params.boundClientKey))[0]
		)}</span
	>
	<span class="head">Program Type:</span>
	<span class="itm"
		>Client{(
			$boundClients[$page.params.boundClientKey]
				? $boundClients[$page.params.boundClientKey].isManager || false
				: false
		)
			? " (Manager Role)"
			: ""}</span
	>
	<span class="head">Loaded Colorways:</span>
	<span class="itm">{noOfColors}</span>
</div>

<style lang="scss">
	div {
		display: flex;
		flex-direction: column;
		color: #fff;
		& > .head {
			font-size: 12px;
			line-height: 1.3333333333333333;
			font-weight: 700;
			text-transform: uppercase;
			letter-spacing: 0.02em;
		}
		& > .itm {
			font-weight: 500;
			font-size: 14px;
			margin-bottom: 8px;
		}
		& > div {
			flex-direction: row;
			gap: 8px;
			margin-bottom: 8px;
		}
	}
</style>
