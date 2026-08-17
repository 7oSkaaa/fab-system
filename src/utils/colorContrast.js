const NAMED_COLORS = {
    black: '#000000',
    white: '#ffffff',
    yellow: '#ffff00',
    gold: '#ffd700',
    orange: '#ffa500',
    red: '#ff0000',
    green: '#008000',
    blue: '#0000ff',
    purple: '#800080',
    pink: '#ffc0cb',
    gray: '#808080',
    grey: '#808080',
    cyan: '#00ffff',
    magenta: '#ff00ff',
    brown: '#a52a2a',
};

const toLinear = (channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};

const mixChannel = (from, to, amount) => Math.round(from + (to - from) * amount);

export const parseRgb = (color) => {
    if (!color || typeof color !== 'string') return null;

    const value = color.trim().toLowerCase();
    if (NAMED_COLORS[value]) return parseRgb(NAMED_COLORS[value]);

    if (value.startsWith('#')) {
        let hex = value.slice(1);
        if (hex.length === 3 || hex.length === 4) {
            hex = [...hex].map(digit => digit + digit).join('');
        }
        if (hex.length === 8) hex = hex.slice(0, 6);
        if (!/^[0-9a-f]{6}$/.test(hex)) return null;
        const numeric = Number.parseInt(hex, 16);
        return [(numeric >> 16) & 255, (numeric >> 8) & 255, numeric & 255];
    }

    const rgb = value.match(/^rgba?\(\s*([\d.]+)\s*[,\s]\s*([\d.]+)\s*[,\s]\s*([\d.]+)/);
    if (!rgb) return null;
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])].map(channel => Math.max(0, Math.min(255, channel)));
};

export const relativeLuminance = (rgb) => {
    if (!rgb) return 0;
    const [red, green, blue] = rgb;
    return 0.2126 * toLinear(red) + 0.7152 * toLinear(green) + 0.0722 * toLinear(blue);
};

const contrastRatio = (first, second) => {
    const lighter = Math.max(first, second);
    const darker = Math.min(first, second);
    return (lighter + 0.05) / (darker + 0.05);
};

export const toHex = ([red, green, blue]) => {
    const hex = [red, green, blue].map(channel => channel.toString(16).padStart(2, '0')).join('');
    return `#${hex}`;
};

const readCssColor = (variableName, fallback) => {
    if (typeof window === 'undefined') return fallback;
    const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
    return parseRgb(value) ? value : fallback;
};

export const contrastInk = (backgroundColor) => (
    relativeLuminance(parseRgb(backgroundColor)) > 0.179 ? '#111827' : '#ffffff'
);

export const isDarkBalloon = (color) => {
    const rgb = parseRgb(color);
    return Boolean(rgb && relativeLuminance(rgb) < 0.14);
};

export const balloonFillStyle = (backgroundColor) => {
    const color = backgroundColor || '#6b7280';
    const rgb = parseRgb(color);
    const ink = contrastInk(color);
    const luminance = rgb ? relativeLuminance(rgb) : 0.4;
    const lightFill = luminance > 0.82;
    const darkFill = luminance < 0.14;
    const edge = lightFill
        ? 'rgba(16, 38, 77, 0.35)'
        : darkFill
            ? 'rgba(255, 255, 255, 0.82)'
            : 'transparent';

    return {
        backgroundColor: color,
        color: ink,
        '--balloon-ink': ink,
        '--balloon-border': edge,
        border: `2px solid ${edge}`,
        boxShadow: darkFill
            ? '0 0 0 1px rgba(255, 255, 255, 0.35)'
            : lightFill
                ? '0 0 0 1px rgba(16, 38, 77, 0.12)'
                : undefined,
    };
};

export const ticketStripeStyle = (color) => {
    const fill = color || '#888888';
    if (!isDarkBalloon(fill)) {
        return { borderLeft: `6px solid ${fill}` };
    }

    return {
        borderLeft: `6px solid ${fill}`,
        boxShadow: 'inset 8px 0 0 0 rgba(255, 255, 255, 0.78), var(--shadow-md)',
    };
};

export const problemInk = (color, surfaceColor) => {
    const foreground = parseRgb(color);
    if (!foreground) return 'var(--text-main)';

    const surface = parseRgb(surfaceColor || readCssColor('--bg-card', '#ffffff')) || [255, 255, 255];
    const foregroundLum = relativeLuminance(foreground);
    const surfaceLum = relativeLuminance(surface);
    if (contrastRatio(foregroundLum, surfaceLum) >= 4.5) return toHex(foreground);

    const toward = surfaceLum > 0.45 ? [17, 24, 39] : [255, 255, 255];
    let low = 0;
    let high = 1;
    let best = toward;

    for (let step = 0; step < 14; step += 1) {
        const amount = (low + high) / 2;
        const mixed = [
            mixChannel(foreground[0], toward[0], amount),
            mixChannel(foreground[1], toward[1], amount),
            mixChannel(foreground[2], toward[2], amount),
        ];
        if (contrastRatio(relativeLuminance(mixed), surfaceLum) >= 4.5) {
            best = mixed;
            high = amount;
        } else {
            low = amount;
        }
    }

    return toHex(best);
};

export const problemColorVars = (color) => {
    const background = color || 'var(--color-primary)';
    return {
        '--problem-color': background,
        '--problem-ink': problemInk(color),
        '--problem-edge': isDarkBalloon(color) ? 'rgba(255, 255, 255, 0.72)' : 'transparent',
    };
};
