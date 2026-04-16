const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/dgnzuhsco/image/upload/";

/**
 * Cloudinary assets (logos, icons, etc.) වල URL එක ලබා ගැනීමට
 * @param {string} fileName - පින්තූරයේ නම (e.g., 'main-logo')
 * @returns {string} - සම්පූර්ණ Cloudinary URL එක
 */
export const getAssetUrl = (fileName, extension = 'png') => {
    if (!fileName) return '';
    
    // බ්‍රවුසර් එක පරණ පින්තූරයම පෙන්වන එක (Caching) වැළැක්වීමට timestamp එකක් එක් කරයි
    const timestamp = new Date().getTime();
    
    return `${CLOUDINARY_BASE_URL}${fileName}.${extension}?t=${timestamp}`;
};