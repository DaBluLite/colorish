<script lang="ts">
	import { DataStore } from "$lib/api";
	import { onMount } from "svelte";

	let noOfColors = "Loading...";

	onMount(async () => (noOfColors = String(await getColorwayLenght())));

	async function getColorwayLenght() {
		const customColorwayData = (
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
		);

		const onlineSources: { name: string; url: string }[] =
			(await DataStore.get("colorwaySourceFiles")) as {
				name: string;
				url: string;
			}[];

		const responses: Response[] = await Promise.all(
			onlineSources.map(({ url }: { url: string }) => fetch(url))
		);

		const colorwayData = (await Promise.all(
			responses
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
				)
		)) as {
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
	<span class="head">Program Identifier:</span>
	<span class="itm">This Manager</span>
	<span class="head">Program Type:</span>
	<span class="itm">Manager</span>
	<span class="head">Loaded Colorways:</span>
	<span class="itm">{noOfColors}</span>
</div>

<style lang="scss">
	div {
		display: flex;
		flex-direction: column;
		color: #fff;
		margin-top: 20px;
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
