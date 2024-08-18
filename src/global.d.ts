/// <reference types="@sveltejs/kit" />
/// <reference types="svelte" />
/// <reference types="vite/client" />
declare interface Window {
	/**
	 * Some exposed electron functionality for communication between the Main and Renderer processes
	 */
	electron: {
		/**
		 * Basic electron window controls
		 */
		window: {
			/**
			 * Closes the window
			 */
			close: () => void;
			/**
			 * Maximizes/restores the window
			 */
			toggleMaximize: () => void;
			/**
			 * Minimizes the window
			 */
			minimize: () => void;
		},
		/**
		 * Dispatches an IPC event with the given data
		 */
		send: (channel: string, data?: any) => void,
		/**
		 * Dispatches an IPC event with the given data (Synchronous)
		 */
		sendSync: (channel: string, data?: any) => void,
		/**
		 * Subscribes to an IPC event, along with a callback
		 */
		receive: (channel: string, func: (...args: any) => void) => void,
		/**
		 * Opens a URL on a browser tab
		 */
		openExtenralPage: (url: string) => void,
		sendToClient: (data: {
			type: "change-colorway" | "remove-colorway" | string,
			boundKey: { [managerKey: string]: string; } | string,
			[key: string]: any
		}) => void
	};
}

declare global {}
interface DiscordUser {
	id: string;
	username: string;
	discriminator: number;
	avatar: string;
  }
	type IDBValidKey = number | string | Date | BufferSource | IDBValidKey[];
	interface Colorway {
		[key: string]: any,
		name: string,
		"dc-import"?: string,
		accent: string,
		primary: string,
		secondary: string,
		tertiary: string,
		original?: boolean,
		author?: string,
		authorID?: string,
		colors?: string[],
		isGradient?: boolean,
		sourceType?: "online" | "offline" | "temporary" | null,
		source?: string,
		linearGradient?: string,
		preset?: string,
		creatorVersion?: string;
	}
	
	interface ColorPickerProps {
		color: number;
		showEyeDropper: boolean;
		suggestedColors: string[];
		label: any;
		onChange(color: number): void;
	}
	
	interface ColorwayObject {
		id: string | null,
		sourceType: "online" | "offline" | "temporary" | null,
		source: string | null | undefined,
		colors?: {
			accent?: string | undefined,
			primary?: string | undefined,
			secondary?: string | undefined,
			tertiary?: string | undefined;
		} | undefined;
	}
	
	interface SourceObject {
		type: SourceType,
		source: string,
		colorways: Colorway[];
	}

	type SourceType = "online" | "offline" | "temporary" | "complication:online" | "complication:offline";
	
	enum SortOptions {
		NAME_AZ = 1,
		NAME_ZA = 2,
		SOURCE_AZ = 3,
		SOURCE_ZA = 4
	}
	
	interface StoreObject {
		sources: StoreItem[];
	}
	
	interface StoreItem {
		name: string,
		id: string,
		description: string,
		url: string,
		authorGh: string;
	}
	interface IDBRequest<T = any> extends EventTarget {
		/**
		 * When a request is completed, returns the error (a DOMException), or null if the request succeeded. Throws a "InvalidStateError" DOMException if the request is still pending.
		 *
		 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/IDBRequest/error)
		 */
		readonly error: DOMException | null;
		/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/IDBRequest/error_event) */
		onerror: ((this: IDBRequest<T>, ev: Event) => any) | null;
		/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/IDBRequest/success_event) */
		onsuccess: ((this: IDBRequest<T>, ev: Event) => any) | null;
		/**
		 * Returns "pending" until a request is complete, then returns "done".
		 *
		 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/IDBRequest/readyState)
		 */
		readonly readyState: IDBRequestReadyState;
		/**
		 * When a request is completed, returns the result, or undefined if the request failed. Throws a "InvalidStateError" DOMException if the request is still pending.
		 *
		 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/IDBRequest/result)
		 */
		readonly result: T;
		/**
		 * Returns the IDBObjectStore, IDBIndex, or IDBCursor the request was made against, or null if is was an open request.
		 *
		 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/IDBRequest/source)
		 */
		readonly source: IDBObjectStore | IDBIndex | IDBCursor;
		/**
		 * Returns the IDBTransaction the request was made within. If this as an open request, then it returns an upgrade transaction while it is running, or null otherwise.
		 *
		 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/IDBRequest/transaction)
		 */
		readonly transaction: IDBTransaction | null;
		addEventListener<K extends keyof IDBRequestEventMap>(type: K, listener: (this: IDBRequest<T>, ev: IDBRequestEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
		addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
		removeEventListener<K extends keyof IDBRequestEventMap>(type: K, listener: (this: IDBRequest<T>, ev: IDBRequestEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
		removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
	}