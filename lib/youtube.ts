export const extractVideoId = (url: string): string | null => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
};

// If no API Key is provided, we can use an oEmbed fallback for basic info (Title/Thumb)
export const fetchOEmbedInfo = async (videoId: string) => {
    try {
        const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
        if (!response.ok) return null;
        const data = await response.json();
        return {
            id: videoId,
            title: data.title,
            thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            channelTitle: data.author_name,
            duration: '0:00', // oEmbed doesn't provide duration
        };
    } catch (err) {
        console.error('oEmbed fetch failed:', err);
        return null;
    }
};

// Minimal Search shim (using a public search endpoint if available or just return a clear message if we need a key)
export const searchYouTube = async (query: string): Promise<any[]> => {
    // For now, if we don't have a backend proxy or API Key, we'll suggest using a URL
    // But we can try a simple client-side fetch to a JSONP search if allowed, 
    // or just return empty for keywords and tell user to use URLs for now if no key.

    // Suggestion: Request API Key from user or use a public CORS-friendly proxy if one exists.
    // For this prototype, I'll implement a basic search fetch if possible, 
    // otherwise I'll stick to URL support which is more reliable without keys.
    return [];
};
