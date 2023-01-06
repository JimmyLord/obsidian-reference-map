import { addIcon } from 'obsidian';

export function addIcons(): void {
    const width = 96
    const height = 96
    addIcon(
        "ReferenceMapIconScroll",
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17v2a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v3h3"></path><path d="M22 17v2a2 2 0 0 1-2 2H8"></path><path d="M19 17V5a2 2 0 0 0-2-2H4"></path><path d="M22 17H10"></path></svg>`
    );
}