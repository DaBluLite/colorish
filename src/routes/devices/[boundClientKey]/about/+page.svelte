<script lang="ts">
	import { page } from "$app/stores";
	import { boundClients } from "$lib/store";
	import { getClientDisplayName } from "$lib/utils/utils";
	import { redirect } from "@sveltejs/kit";
	import { onMount } from "svelte";

	let noOfColors = "Loading...";

	onMount(async () => (noOfColors = String(await getColorwayLenght())));

	const boundClientKey: string = $page.params.boundClientKey;

	if (!$boundClients[boundClientKey]) {
		redirect(301, "/devices/this/about");
	}

	async function getColorwayLenght() {
		async function getOnline() {
			const onlineComplSources: { name: string; url: string }[] =
				Object.values($boundClients)
					.map((cl) => {
						if (cl.online) {
							return cl.online.map((source) => ({
								name: `${
									Object.values(JSON.parse(cl.boundKey))[0]
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
				onlineComplSources.map(({ url }: { url: string }) => fetch(url))
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
									Object.values(JSON.parse(cl.boundKey))[0]
								}: ${source.name}`,
								colorways: source.colorways,
						  }))
						: []
				)
				.flat(2);
		}

		return [
			...($boundClients[boundClientKey] &&
			$boundClients[boundClientKey].online
				? (await getOnline()).flatMap(({ colorways }) => colorways)
				: []),
			...($boundClients[boundClientKey] &&
			$boundClients[boundClientKey].offline
				? getOffline().flatMap(({ colorways }) => colorways)
				: []),
		].length;
	}

	window.electron.receive("update-bound-clients", () => {
		getColorwayLenght();
	});
</script>

<div>
	<div>
		<button
			class="button"
			on:click={() => {
				window.electron.sendToClient({
					type: $boundClients[boundClientKey].isManager
						? "complication:manager-role:revoked"
						: "complication:manager-role:granted",
					boundKey: boundClientKey,
				});
			}}
		>
			{$boundClients[boundClientKey] &&
			($boundClients[boundClientKey].isManager || false)
				? "Revoke"
				: "Grant"} Manager Role
		</button>
		<button
			class="button"
			on:click={() => navigator.clipboard.writeText(boundClientKey)}
		>
			Copy Bound Key
		</button>
		<button
			class="button"
			on:click={() =>
				window.electron.sendToClient({
					type: "complication:remote-sources:update-request",
					boundKey: boundClientKey,
				})}
		>
			Request Source Update
		</button>
	</div>
	<span class="head">Program Identifier:</span>
	<span class="itm"
		>{getClientDisplayName(
			Object.values(JSON.parse(boundClientKey))[0]
		)}</span
	>
	<span class="head">Program Type:</span>
	<span class="itm"
		>Client{(
			$boundClients[boundClientKey]
				? $boundClients[boundClientKey].isManager || false
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
