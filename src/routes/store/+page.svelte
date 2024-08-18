<script lang="ts">
	import { DataStore } from "$lib/api";
	import { onMount } from "svelte";

	let searchValue = "";
	let sourcesList: StoreItem[] = [];
	let colorwaySourceFiles: { name: string; url: string }[] = [];

	onMount(() => {
		if (!searchValue) {
			(async function () {
				const res: Response = await fetch(
					"https://dablulite.vercel.app/"
				);
				const data = await res.json();
				sourcesList = data.sources;
				colorwaySourceFiles = (await DataStore.get(
					"colorwaySourceFiles"
				)) as { name: string; url: string }[];
			})();
		}
	});

	import GitHubIcon from "$lib/github-light.svg";
	import PalleteIcon from "../../lib/components/PalleteIcon.svelte";
	import DownloadIcon from "../../lib/components/DownloadIcon.svelte";
	import DeleteIcon from "../../lib/components/DeleteIcon.svelte";
</script>

<div style="display: flex; margin-bottom: 8px;">
	<input
		type="text"
		placeholder="Search for sources..."
		value={searchValue}
		on:input={(e) => (searchValue = e.currentTarget.value)}
	/>
	<button
		class="button"
		style="margin-left: 8px; margin-top: auto; margin-bottom: auto;"
		on:click={async function () {
			const res = await fetch("https://dablulite.vercel.app/");
			const data = await res.json();
			sourcesList = data.sources;
			colorwaySourceFiles = await DataStore.get("colorwaySourceFiles");
		}}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			x="0px"
			y="0px"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="currentColor"
			style="box-sizing: content-box;"
			><rect y="0" fill="none" width="24" height="24" /><path
				d="M6.351,6.351C7.824,4.871,9.828,4,12,4c4.411,0,8,3.589,8,8h2c0-5.515-4.486-10-10-10 C9.285,2,6.779,3.089,4.938,4.938L3,3v6h6L6.351,6.351z"
			/><path
				d="M17.649,17.649C16.176,19.129,14.173,20,12,20c-4.411,0-8-3.589-8-8H2c0,5.515,4.486,10,10,10 c2.716,0,5.221-1.089,7.062-2.938L21,21v-6h-6L17.649,17.649z"
			/></svg
		>
		Refresh
	</button>
</div>
<div class="scroller">
	{#each sourcesList as source}
		{#if source.name.toLowerCase().includes(searchValue.toLowerCase())}
			<div class="source">
				<div
					style="gap: .5rem; display: flex; margin-bottom: 8px; flex-direction: column"
				>
					<span class="colorwaysSettings-colorwaySourceLabelHeader">
						{source.name}
					</span>
					<span class="colorwaysSettings-colorwaySourceDesc">
						{source.description}
					</span>
					<span
						class="colorwaysSettings-colorwaySourceDesc"
						style="opacity: .8"
					>
						by {source.authorGh}
					</span>
				</div>
				<div
					style="gap: 8px; align-items: center; width: 100%; display: flex;"
				>
					<a
						target="_blank"
						href={"https://github.com/" + source.authorGh}
						><img src={GitHubIcon} alt="GitHub" /></a
					>
					<button
						class="button surface"
						style="margin-left: auto;"
						on:click={async () => {
							if (
								colorwaySourceFiles
									.map((source) => source.name)
									.includes(source.name)
							) {
								const sourcesArr = colorwaySourceFiles.filter(
									(sourcee) => source.name !== sourcee.name
								);
								DataStore.set(
									"colorwaySourceFiles",
									sourcesArr
								);
								colorwaySourceFiles = sourcesArr;
							} else {
								const sourcesArr = [
									...colorwaySourceFiles,
									{ name: source.name, url: source.url },
								];
								DataStore.set(
									"colorwaySourceFiles",
									sourcesArr
								);
								colorwaySourceFiles = sourcesArr;
							}
						}}
					>
						{#if colorwaySourceFiles
							.map((source) => source.name)
							.includes(source.name)}
							<DeleteIcon width={14} height={14} /> Remove
						{:else}
							<DownloadIcon width={14} height={14} /> Add to Sources
						{/if}
					</button>
					<button class="button surface" on:click={async () => {}}>
						<PalleteIcon width={14} height={14} />
						Preview
					</button>
				</div>
			</div>
		{/if}
	{/each}
</div>

<style lang="scss">
	.scroller {
		scrollbar-width: none;
		display: flex;
		flex-direction: column;
		gap: 8px;
		overflow: hidden auto;
	}
	span {
		color: #fff;
	}
	.source {
		display: flex;
		justify-content: space-between;
		gap: 5px;
		border-radius: 8px;
		box-sizing: border-box;
		background-color: #101010;
		flex-direction: column;
		padding: 16px;
		align-items: start;
	}
</style>
