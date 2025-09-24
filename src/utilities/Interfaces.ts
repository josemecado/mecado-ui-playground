export const extractVersionNumber = (str: string): number | null => {
    // Match one or more digits after 'v'
    const match = str.match(/v(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
};