function formatUsingUnits(bytes: number, units: string[], log: number): string {
    if (bytes === 0) {
        return '0 B';
    }
    const exponent = Math.floor(Math.log(bytes) / Math.log(log));
    const size = bytes / Math.pow(log, exponent);
    return `${size.toFixed(0)} ${units[exponent]}`;
}

// This function formats a given byte size a into a human-readable string with binary prefixes (KiB, MiB, GiB, etc.).
// It calculates the appropriate binary prefix (e.g., KiB for kilobyte) based on the magnitude of the byte size.
// Returns the formatted string with the byte size and its corresponding binary prefix.
export function format(bytes: number): string {
    const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    return formatUsingUnits(bytes, units, 1024);
}

// This function formats a given byte size a into a human-readable string with metric prefixes (kB, MB, GB, etc.).
// It calculates the appropriate metric prefix (e.g., kB for kilobyte) based on the magnitude of the byte size.
// Returns the formatted string with the byte size and its corresponding metric prefix.
export function metricFormat(bytes: number): string {
    const units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    return formatUsingUnits(bytes, units, 1000);
}

/**
 * Convert human-readable size to bytes.
 *
 * <div>Example:
 * ```javascript
 * parse("50 MB") // 52428800
 * parse("50gb")  // 53687091200
 * parse("50G")   // 53687091200
 * ```
 * </div>
 * @param {String} text
 * @return {Number} how many bytes
 */
export function parse(text: string): number {
    const powers = { 'k': 1, 'm': 2, 'g': 3, 't': 4 };
    const regex = /(\d+(?:\.\d+)?)\s?(k|m|g|t)?b?/i;

    const res = regex.exec(text);

    const num = parseFloat(res?.[1] || text);
    const multiplier = Math.pow(1024, powers[res?.[2].toLowerCase() as keyof typeof powers] || 1);

    return num * multiplier;
}
