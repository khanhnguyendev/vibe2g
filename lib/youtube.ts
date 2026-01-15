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

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

// Minimal Search shim
export const searchYouTube = async (query: string): Promise<any[]> => {
    if (!YOUTUBE_API_KEY) {
        console.error('YouTube API Key missing');
        return [];
    }

    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(
                query
            )}&type=video&key=${YOUTUBE_API_KEY}`
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error('YouTube API Error Details:', JSON.stringify(errorData, null, 2));

            // Provide a hint for 403 errors
            if (response.status === 403) {
                console.warn('HINT: 403 Forbidden usually means:\n1. YouTube Data API v3 is not enabled in your Google Cloud Console.\n2. Your API Key is restricted (check Referer/IP restrictions).\n3. You have exceeded your daily quota.');
            }
            return [];
        }

        const data = await response.json();

        // Fetch durations and stats separately because search API doesn't provide them
        const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
        const detailsResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
        );
        const detailsData = await detailsResponse.json();
        const detailsMap = Object.fromEntries(
            detailsData.items.map((item: any) => [
                item.id,
                {
                    duration: parseISO8601Duration(item.contentDetails.duration),
                    viewCount: item.statistics.viewCount
                }
            ])
        );

        return data.items.map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
            channelTitle: item.snippet.channelTitle,
            duration: detailsMap[item.id.videoId]?.duration || '0:00',
            viewCount: detailsMap[item.id.videoId]?.viewCount || '0',
        }));
    } catch (err) {
        console.error('YouTube search failed:', err);
        return [];
    }
};

const parseISO8601Duration = (duration: string) => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const fetchVideoDetails = async (videoId: string) => {
    if (!YOUTUBE_API_KEY) return fetchOEmbedInfo(videoId);

    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`
        );
        if (!response.ok) return fetchOEmbedInfo(videoId);

        const data = await response.json();
        const item = data.items[0];
        if (!item) return null;

        return {
            id: videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
            channelTitle: item.snippet.channelTitle,
            duration: parseISO8601Duration(item.contentDetails.duration),
            viewCount: item.statistics.viewCount,
        };
    } catch (err) {
        console.error('YouTube fetchVideoDetails failed:', err);
        return fetchOEmbedInfo(videoId);
    }
};
