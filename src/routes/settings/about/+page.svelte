<script lang="ts">
	import { DataStore } from "$lib/api";
	import { boundClients } from "$lib/store";
	import { onMount } from "svelte";

	let noOfColors = "Loading...";

	onMount(async () => (noOfColors = String(await getColorwayLenght())));

	async function getColorwayLenght() {
		const customColorwayData = [
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
			onlineSources.map(({ url }: { url: string }) => fetch(url))
		);

		const complicationResponses: Response[] = await Promise.all(
			onlineComplSources.map(({ url }: { url: string }) => fetch(url))
		);

		const colorwayData = (await Promise.all([
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

		return [
			...colorwayData.flatMap(({ colorways }) => colorways),
			...customColorwayData.flatMap(({ colorways }) => colorways),
		].length;
	}
</script>

<div>
	<h1>Colorish</h1>
	<span class="brand">by Project Colorway</span>
	<span class="head">Version:</span>
	<span class="itm">1.0.0</span>
	<span class="head">Loaded Colorways:</span>
	<span class="itm">{noOfColors}</span>
</div>

<style lang="scss">
	div {
		display: flex;
		flex-direction: column;
		color: #fff;
		margin-top: 20px;
		& > h1 {
			font-family: "Edu AU VIC WA NT Hand", cursive;
			font-size: 31px;
			line-height: 31px;
			margin: 0px;
			font-weight: normal;
		}
		& > .brand {
			font-weight: 500;
			font-size: 14px;
			margin-bottom: 12px;
			opacity: 0.8;
		}
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
	}
</style>
