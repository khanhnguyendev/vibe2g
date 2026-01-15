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
            console.error('YouTube API Error:', errorData);
            return [];
        }

        const data = await response.json();

        // Fetch durations separately because search API doesn't provide them
        const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
        const detailsResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`
        );
        const detailsData = await detailsResponse.json();
        const durationsMap = Object.fromEntries(
            detailsData.items.map((item: any) => [item.id, parseISO8601Duration(item.contentDetails.duration)])
        );

        return data.items.map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
            channelTitle: item.snippet.channelTitle,
            duration: durationsMap[item.id.videoId] || '0:00',
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
