// Facebook API helper for fetching comments
const FB_API_VERSION = 'v19.0';
const FB_API_BASE = `https://graph.facebook.com/${FB_API_VERSION}`;

export interface FBComment {
  id: string;
  message: string;
  created_time: string;
  from?: {
    id: string;
    name: string;
  };
  permalink_url?: string;
}

export interface FBCommentsResponse {
  data: FBComment[];
  paging?: {
    cursors?: { before?: string; after?: string };
    next?: string;
    previous?: string;
  };
}

export interface FBPost {
  id: string;
  message?: string;
  created_time?: string;
  full_picture?: string;
}

/** Safe token handling */
const encToken = (t: string) => encodeURIComponent((t || '').trim());

/** Build Graph URL safely */
function graphUrl(path: string, params: Record<string, string | number | undefined>, token: string) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    usp.set(k, String(v));
  }
  usp.set('access_token', (token || '').trim()); // let URLSearchParams encode
  return `${FB_API_BASE}/${path.replace(/^\//, '')}?${usp.toString()}`;
}

/** Extract post ID from Facebook URL - supports multiple formats */
export function extractPostId(url: string): string | null {
  try {
    const urlObj = new URL(url);

    // Format 1: /posts/123456789 or /posts/pfbid...
    const postsMatch = url.match(/\/posts\/(\d+|pfbid[\w]+)/);
    if (postsMatch) return postsMatch[1];

    // Format 2: story_fbid=123456&id=pageId
    const storyFbid = urlObj.searchParams.get('story_fbid');
    const pageId = urlObj.searchParams.get('id');
    if (storyFbid && pageId) return `${pageId}_${storyFbid}`;

    // Format 3/4: fbid=123456 (post/photo)
    const fbid = urlObj.searchParams.get('fbid');
    if (fbid) return fbid;

    // Format 5: Direct numeric id in path
    const directIdMatch = url.match(/\/(\d{10,25})(?:\/|$|\?)/);
    if (directIdMatch) return directIdMatch[1];

    return null;
  } catch {
    return null;
  }
}

/** Fetch comments from a Facebook object id */
async function fetchCommentsForId(
  id: string,
  accessToken: string,
  limit: number
): Promise<{ ok: boolean; comments: FBComment[]; error?: string }> {
  const url = graphUrl(`${id}/comments`, {
    fields: 'id,message,created_time,from{id,name},permalink_url',
    filter: 'stream',
    limit,
  }, accessToken);

  const res = await fetch(url);
  const text = await res.text();

  if (!res.ok) {
    // try parse error
    try {
      const e = JSON.parse(text);
      return { ok: false, comments: [], error: e?.error?.message || text };
    } catch {
      return { ok: false, comments: [], error: text };
    }
  }

  try {
    const data: FBCommentsResponse = JSON.parse(text);
    return { ok: true, comments: data.data || [] };
  } catch {
    return { ok: false, comments: [], error: 'Invalid JSON from Facebook API' };
  }
}

/** Try to find object_id for a post (photo/video that may carry comments) */
async function getCommentCarrierIds(
  postId: string,
  accessToken: string
): Promise<{ ids: string[]; debug?: any; error?: string }> {
  // Only use object_id which is still supported (attachments is deprecated)
  const url = graphUrl(postId, {
    fields: 'object_id',
  }, accessToken);

  const res = await fetch(url);
  const text = await res.text();

  if (!res.ok) {
    try {
      const e = JSON.parse(text);
      return { ids: [], error: e?.error?.message || text };
    } catch {
      return { ids: [], error: text };
    }
  }

  let json: any = {};
  try {
    json = JSON.parse(text);
  } catch {
    return { ids: [], error: 'Invalid JSON from Facebook API' };
  }

  const ids: string[] = [];
  // object_id is the photo/video id where comments might actually be
  if (json?.object_id) ids.push(String(json.object_id));

  return { ids, debug: json };
}

/**
 * Fetch comments from a Facebook post - robust for "ข้อความ + รูป"
 * Tries:
 *  1) postId/comments
 *  2) post's object_id/comments (photo/video object)
 *  3) every attachments.target.id/comments
 */
export async function fetchFacebookComments(
  postIdOrUrl: string,
  accessToken: string,
  limit: number = 100
): Promise<{ comments: FBComment[]; error?: string; postId?: string; sourceId?: string }> {
  try {
    const token = (accessToken || '').trim();
    if (!token) return { comments: [], error: 'Missing access token' };

    // Normalize postId
    let postId = postIdOrUrl;
    if (postIdOrUrl.includes('facebook.com')) {
      const extracted = extractPostId(postIdOrUrl);
      if (extracted) postId = extracted;
    }

    // 0) Try comments directly on postId first
    {
      const r = await fetchCommentsForId(postId, token, limit);
      if (r.ok && r.comments.length > 0) {
        // paginate if needed
        return { comments: r.comments, postId, sourceId: postId };
      }
    }

    // 1) Try object_id + attachments target ids
    const carriers = await getCommentCarrierIds(postId, token);

    // If we can’t read attachments, still continue (maybe permissions), but return helpful error only if nothing found
    if (carriers.ids.length > 0) {
      for (const id of carriers.ids) {
        const r = await fetchCommentsForId(id, token, limit);
        if (r.ok && r.comments.length > 0) {
          return { comments: r.comments, postId, sourceId: id };
        }
      }
    }

    // 2) Still nothing—return empty with hint (no comments OR permission/object mismatch)
    if (carriers.error) {
      return {
        comments: [],
        postId,
        error:
          `ดึงคอมเมนต์ไม่ได้ (อ่าน attachments/object ไม่ได้)\n` +
          `- เช็คว่าใช้ Page Access Token ของเพจเดียวกับโพส\n` +
          `- permission แนะนำ: pages_show_list, pages_read_engagement, pages_read_user_content\n` +
          `- รายละเอียด: ${carriers.error}`,
      };
    }

    return { comments: [], postId }; // genuinely no comments or not readable
  } catch (error) {
    return { comments: [], error: error instanceof Error ? error.message : 'Network error' };
  }
}

/**
 * Get page posts to find the correct post ID - with pagination support
 */
export async function getPagePosts(
  pageId: string,
  accessToken: string,
  limit: number = 100,
  maxPosts: number = 500
): Promise<{ posts: FBPost[]; error?: string }> {
  try {
    const token = (accessToken || '').trim();
    if (!token) return { posts: [], error: 'Missing access token' };

    let allPosts: FBPost[] = [];
    let nextUrl: string | null = graphUrl(`${pageId}/posts`, {
      fields: 'id,message,created_time,full_picture',
      limit,
    }, token);

    while (nextUrl && allPosts.length < maxPosts) {
      const res = await fetch(nextUrl);
      const text = await res.text();

      if (!res.ok) {
        try {
          const e = JSON.parse(text);
          return { posts: allPosts, error: e?.error?.message || text };
        } catch {
          return { posts: allPosts, error: text };
        }
      }

      const jsonData: { data?: FBPost[]; paging?: { next?: string } } = JSON.parse(text);
      allPosts = [...allPosts, ...(jsonData.data || [])];
      nextUrl = jsonData.paging?.next || null;
    }

    return { posts: allPosts };
  } catch (error) {
    return { posts: [], error: error instanceof Error ? error.message : 'Network error' };
  }
}

/**
 * Validate access token and get user/page info
 * Note: For Page token, /me returns Page id & name; for User token, returns User id & name.
 */
export async function validateAccessToken(accessToken: string): Promise<{
  valid: boolean;
  error?: string;
  userId?: string;
  name?: string;
}> {
  try {
    const token = (accessToken || '').trim();
    if (!token) return { valid: false, error: 'Missing access token' };

    const url = graphUrl('me', { fields: 'id,name' }, token);
    const response = await fetch(url);
    const text = await response.text();

    if (!response.ok) {
      try {
        const e = JSON.parse(text);
        return { valid: false, error: e?.error?.message || text };
      } catch {
        return { valid: false, error: text || 'Invalid token' };
      }
    }

    const data = JSON.parse(text);
    return { valid: true, userId: data.id, name: data.name };
  } catch {
    return { valid: false, error: 'Network error' };
  }
}

/**
 * Get pages that the user/app has access to
 * Requires USER token with pages_show_list (and user must manage the page).
 */
export async function getPages(accessToken: string): Promise<{
  pages: { id: string; name: string; access_token: string }[];
  error?: string;
}> {
  try {
    const token = (accessToken || '').trim();
    if (!token) return { pages: [], error: 'Missing access token' };

    const url = graphUrl('me/accounts', { fields: 'id,name,access_token' }, token);
    const response = await fetch(url);
    const text = await response.text();

    if (!response.ok) {
      try {
        const e = JSON.parse(text);
        return { pages: [], error: e?.error?.message || text };
      } catch {
        return { pages: [], error: text || 'Failed to fetch pages' };
      }
    }

    const data = JSON.parse(text);
    return { pages: data.data || [] };
  } catch {
    return { pages: [], error: 'Network error' };
  }
}
