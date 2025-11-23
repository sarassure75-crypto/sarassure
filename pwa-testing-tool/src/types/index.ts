export interface PwaConfig {
    name: string;
    short_name: string;
    start_url: string;
    display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
    background_color: string;
    theme_color: string;
    icons: Array<Icon>;
}

export interface Icon {
    src: string;
    sizes: string;
    type: string;
}