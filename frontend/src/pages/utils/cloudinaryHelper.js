const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/dgnzuhsco/image/upload/";

/**
 * Cloudinary assets (static logos, icons) සහ Dynamic URLs දෙකම හැඬල් කිරීමට
 * @param {string} input - පින්තූරයේ නම හෝ සම්පූර්ණ URL එක
 * @param {string} extension - ෆයිල් format එක (default 'png')
 * @returns {string} - නිවැරදි Cloudinary URL එක
 */
export const getAssetUrl = (input, extension = 'png') => {
    if (!input) return '';

    // 1. input එක දැනටමත් සම්පූර්ණ URL එකක් නම් (http වලින් පටන් ගනී නම්) ඒකම රිටර්න් කරනවා
    if (input.startsWith('http://') || input.startsWith('https://')) {
        return input;
    }

    // 2. input එක ෆයිල් නමක් විතරක් නම් (Static Asset), පරණ විදිහට URL එක හදනවා
    const timestamp = new Date().getTime();
    return `${CLOUDINARY_BASE_URL}${input}.${extension}?t=${timestamp}`;
};