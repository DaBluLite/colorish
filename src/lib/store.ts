import { writable } from 'svelte/store';

export const addonlinesource_open = writable(false);

export const createofflinesource_open = writable(false);

export const savecolorwaymodal_open = writable(false);

export const boundClients = writable({} as {
    [boundKey: string]: {
        boundKey: string;
        complications?: string[];
        online?: { name: string, url: string }[];
        offline?: { name: string, colorways: Colorway[] }[];
        isManager?: boolean
    };
});