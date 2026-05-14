const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/dgnzuhsco/image/upload/";

/**
 * To handle both Cloudinary assets (static logos, icons) and Dynamic URLs
 * @param {string} input - Image name or full URL
 * @param {string} extension - File format (default 'png')
 * @returns {string} - The correct Cloudinary URL
 */
export const getAssetUrl = (input, extension = 'png') => {
    if (!input) return '';

    // 1.If the input is already a full URL (starting with http), it will return the same. If the input is already a full URL (starting with http), it will return the same.
    if (input.startsWith('http://') || input.startsWith('https://')) {
        return input;
    }

    // 2.If the input is just a file name (Static Asset), the URL is created in the old way.
    const timestamp = new Date().getTime();
    return `${CLOUDINARY_BASE_URL}${input}.${extension}?t=${timestamp}`;
};