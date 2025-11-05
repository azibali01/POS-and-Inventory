/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL?: string
    readonly MODE: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

// CSS modules
declare module "*.css" {
    const content: Record<string, string>;
    export default content;
}

declare module "*.scss" {
    const content: Record<string, string>;
    export default content;
}