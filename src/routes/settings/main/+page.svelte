<script lang="ts">
	import { DataStore } from "$lib/api";
	import { onMount } from "svelte";

	let username = "";

	onMount(async () => {
		username = ((await DataStore.get("Username")) as string) || "";
	});
</script>

<span class="sect-header">This User</span>
<div class="setting">
	<div class="row">
		<span class="label">Username</span>
		<input
			type="text"
			placeholder="Enter a valid Username..."
			value={username}
			on:input={({ currentTarget: { value } }) => {
				username = value;
				DataStore.set("Username", value);
			}}
		/>
	</div>
	<span class="note">The username used when creating colorways</span>
	<div class="divider" />
</div>

<style lang="scss">
	.setting {
		display: flex;
		flex-direction: column;
		margin-bottom: 20px;
		& > .note {
			color: #fff;
			opacity: 0.5;
		}
		& > .row {
			display: flex;
			flex-direction: row;
			width: 100%;
			align-items: center;
			cursor: pointer;
			& > .label {
				flex: 1;
				display: block;
				overflow: hidden;
				margin-top: 0;
				margin-bottom: 0;
				color: #fff;
				line-height: 24px;
				font-size: 16px;
				font-weight: 500;
				word-wrap: break-word;
				cursor: pointer;
			}
		}
		& > .divider {
			width: 100%;
			height: 1px;
			border-top: thin solid #fff;
			margin-top: 20px;
		}
	}
	.sect-header {
		font-size: 14px;
		margin-bottom: 4px;
		display: inline-block;
		width: 100%;
	}
</style>
