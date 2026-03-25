export interface YouTubeVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  description: string;
  duration: string;
  publishedAt: string;
  thumbnail: string;
}

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    description: string;
    publishedAt: string;
    thumbnails: { default: { url: string } };
  };
}

interface YouTubeVideoDetailsItem {
  id: string;
  contentDetails: { duration: string };
}

/**
 * Searches YouTube Data API v3, restricted to the provided channel/playlist IDs.
 */
export async function searchYouTube(
  apiKey: string,
  query: string,
  channelIds: string[],
  maxResults = 10
): Promise<YouTubeVideo[]> {
  const videos: YouTubeVideo[] = [];

  for (const channelId of channelIds) {
    if (videos.length >= maxResults) break;

    const params = new URLSearchParams({
      part: 'snippet',
      type: 'video',
      q: query,
      channelId,
      maxResults: String(Math.min(maxResults - videos.length, 10)),
      key: apiKey,
    });

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params}`
    );

    if (!res.ok) continue;

    const data = (await res.json()) as { items?: YouTubeSearchItem[] };
    const items = data.items ?? [];

    if (items.length === 0) continue;

    // Fetch durations in bulk
    const ids = items.map((i) => i.id.videoId).join(',');
    const detailsParams = new URLSearchParams({
      part: 'contentDetails',
      id: ids,
      key: apiKey,
    });

    const detailsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?${detailsParams}`
    );
    const detailsData = detailsRes.ok
      ? ((await detailsRes.json()) as { items?: YouTubeVideoDetailsItem[] })
      : { items: [] };

    const durationMap = new Map<string, string>();
    for (const d of detailsData.items ?? []) {
      durationMap.set(d.id, formatISODuration(d.contentDetails.duration));
    }

    for (const item of items) {
      videos.push({
        videoId: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        description: item.snippet.description,
        duration: durationMap.get(item.id.videoId) ?? '',
        publishedAt: item.snippet.publishedAt,
        thumbnail: item.snippet.thumbnails.default.url,
      });
    }
  }

  return videos.slice(0, maxResults);
}

/** Converts ISO 8601 duration (PT1H2M3S) to human-readable (1:02:03) */
function formatISODuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '';
  const h = parseInt(match[1] ?? '0', 10);
  const m = parseInt(match[2] ?? '0', 10);
  const s = parseInt(match[3] ?? '0', 10);
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}
