<script lang="ts">
	import { onMount } from "svelte";
	import "$lib/app.scss";
	onMount(() => {
		(async function () {
			const [
				customColorways,
				colorwaySourceFiles,
				onDemandWaysOsAccentColor,
				activeColorwayObject,
				UUID,
			] = await DataStore.getMany([
				"customColorways",
				"colorwaySourceFiles",
				"onDemandWaysOsAccentColor",
				"activeColorwayObject",
				"UUID",
			]);

			const defaults = [
				{
					name: "onDemandWaysOsAccentColor",
					value: onDemandWaysOsAccentColor,
					default: false,
				},
				{
					name: "activeColorwayObject",
					value: activeColorwayObject,
					default: {
						id: null,
						css: null,
						sourceType: null,
						source: null,
						colors: {
							accent: null,
							primary: null,
							secondary: null,
							tertiary: null,
						},
					},
				},
			];

			defaults.forEach(({ name, value, default: def }) => {
				if (!value) DataStore.set(name, def);
			});

			if (!customColorways) {
				DataStore.set("customColorways", []);
			}

			if (!UUID) {
				var array = new Uint32Array(1);
				window.crypto.getRandomValues(array);
				DataStore.set("UUID", array[0]);
				window.electron.send("ui-online", {
					UUID: array[0],
				});
			} else {
				window.electron.send("ui-online", {
					UUID,
				});
			}

			if (colorwaySourceFiles) {
				if (typeof colorwaySourceFiles[0] === "string") {
					DataStore.set(
						"colorwaySourceFiles",
						colorwaySourceFiles.map(
							(sourceURL: string, i: number) => {
								return {
									name:
										sourceURL === defaultColorwaySource
											? "Project Colorway"
											: `Source #${i}`,
									url:
										sourceURL ===
										"https://raw.githubusercontent.com/DaBluLite/ProjectColorway/master/index.json"
											? defaultColorwaySource
											: sourceURL,
								};
							}
						)
					);
				}
			} else {
				DataStore.set("colorwaySourceFiles", [
					{
						name: "Project Colorway",
						url: defaultColorwaySource,
					},
				]);
			}
		})();
	});
	import "bootstrap-icons/font/bootstrap-icons.scss";
	import { page } from "$app/stores";
	import { DataStore } from "$lib/api";
	import { defaultColorwaySource, nullColorwayObj } from "../constants";

	import { browser } from "$app/environment";
	import { boundClients } from "$lib/store";
	import ClientManagerRequestModal from "$lib/components/ClientManagerRequestModal.svelte";

	let managerRequest_open: boolean = false;
	let managerRequest_boundKey = { "242354234": "discord.6teggre3276.604" };

	if (window.electron && browser) {
		window.electron.receive("client-connected", (data: any) => {
			DataStore.get("activeColorwayObject").then((aco) => {
				window.electron.send("colorway-updated", {
					activeColorwayObject: aco,
				});
			});
		});
		window.electron.receive("update-bound-clients", ({ clients }) =>
			boundClients.set(clients)
		);
		window.electron.receive(
			"complication:manager-role:request",
			(boundKey) => {
				managerRequest_boundKey = boundKey;
				managerRequest_open = true;
			}
		);
		window.electron.receive(
			"complication:remote-sources:received-sources",
			({
				boundKey: bound,
				online,
				offline,
			}: {
				boundKey: string;
				online: any[];
				offline: any[];
			}) => {
				const boundKey = JSON.stringify(bound);
				boundClients.set({
					...$boundClients,
					[boundKey]: {
						...$boundClients[boundKey],
						online: online,
						offline: offline,
					},
				});
			}
		);

		window.electron.receive(
			"complication:manager-role:receive-colorway",
			async (color) => {
				const activeColorwayObject = await DataStore.get(
					"activeColorwayObject"
				);
				if (
					activeColorwayObject.id === color.name &&
					activeColorwayObject.source === color.source
				) {
					DataStore.set("activeColorwayObject", nullColorwayObj);
					window.electron.send("colorway-removed");
				} else {
					window.electron.send("colorway-updated", {
						activeColorwayObject: color,
					});
				}
			}
		);
	}
</script>

<div class="dragbar">
	<h3>Colorish</h3>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div>
		<div on:click={() => window.electron.window.minimize()}>&#xF274;</div>
		<div
			on:click={() => window.electron.window.toggleMaximize()}
			style="font-size: .8rem;"
		>
			&#xF584;
		</div>
		<div on:click={() => window.electron.window.close()}>&#xF659;</div>
	</div>
</div>

<div style="display: flex; flex-direction: row; width: 100%; height: 100%;">
	<nav class="global_nav">
		<a href="/" class={$page.url.pathname == "/" ? "active" : ""}></a>
		<a
			href="/settings/main"
			class={$page.url.pathname.startsWith("/settings") ? "active" : ""}
			></a
		>
		<a
			href="/devices/this/about"
			class={$page.url.pathname.startsWith("/devices") ? "active" : ""}
			>&#xF227;</a
		>
		<a href="/store" class={$page.url.pathname == "/store" ? "active" : ""}
			></a
		>
	</nav>

	<div
		style="padding: 16px; box-sizing: border-box; width: 100%; height: calc(100% - 40px); display: flex; flex-direction: column; gap: 8px;"
	>
		<slot />
	</div>
</div>

<ClientManagerRequestModal
	bind:open={managerRequest_open}
	bind:boundKey={managerRequest_boundKey}
/>

<style lang="scss">
	@import url("https://fonts.googleapis.com/css2?family=Comfortaa:wght@300..700&family=Edu+AU+VIC+WA+NT+Hand:wght@400..700&display=swap");
	@font-face {
		font-family: "NDOT";
		src: url("/fonts//ndot.otf");
	}
	.dragbar {
		-webkit-app-region: drag;
		z-index: 100;
		height: 40px;
		width: 100%;
		color: #fff;
		display: flex;
		& > h3 {
			margin: 0;
			font-family: "Edu AU VIC WA NT Hand", cursive;
			font-weight: normal;
			line-height: 40px;
			margin-left: 16px;
			margin-right: auto;
		}
		& > div {
			font-family: bootstrap-icons;
			display: flex;
			gap: 8px;
			padding: 4px;
			& > div {
				width: 32px;
				height: 32px;
				border-radius: 50px;
				background-color: #101010;
				cursor: pointer;
				line-height: 32px;
				text-align: center;
				-webkit-app-region: no-drag;
			}
		}
	}
	nav {
		background-color: #101010;
		color: #fff;
		box-sizing: border-box;
		height: 100%;
		flex: 0 0 auto;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		border-top-right-radius: 16px;
		& > a {
			color: #fff;
			text-decoration: none;
			font-family: bootstrap-icons;
			width: 48px;
			height: 48px;
			border-radius: 8px;
			cursor: pointer;
			transition: 0.2s ease;
			border: 1px solid transparent;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 24px;
			&:hover {
				background-color: #2a2a2a;
			}
			&.active {
				background-color: #0a0a0a;
				border-color: #a6a6a6;
			}
		}
	}
</style>
