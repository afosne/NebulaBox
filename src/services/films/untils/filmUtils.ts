/**
 * 影片数据处理工具函数
 * 功能：处理苹果CMS返回数据，转换为本地数据库兼容格式
 */

// ========================== 类型定义 ==========================
/** 播放源与films表web字段的映射类型 */
export type WebMapType = Record<string, number> & {
  qiyi: number;
  qq: number;
  youku: number;
  mgtv: number;
  bilibili: number;
};

/** 苹果CMS返回的单条影片数据结构 */
export interface AppleCMSFilmData {
  type_id?: number;
  vod_name?: string;
  vod_total?: string | number;
  vod_remarks?: string;
  type_name?: string;
  vod_play_from?: string;
  vod_play_url?: string;
  vod_pic?: string;
  vod_pic_thumb?: string;
  vod_blurb?: string;
  vod_content?: string;
  [key: string]: unknown; // 避免 any
}

/** 拆分后的单集影片数据结构（用于插入数据库） */
export interface EpisodeData {
  episode: number;
  source_url: string;
  web: number;
}

/** films表插入数据结构（与表字段完全对齐） */
export interface FilmInsertData {
  title: string;
  episode: number | null;
  web: number;
  category_id: number | null;
  cover_url: string;
  description: string;
  source_url: string;
  created_at: string;
  updated_at: string;
}

// ========================== 工具函数 ==========================
/**
 * 匹配播放源到films表的web字段
 */
export function matchWebType(playFrom: string ): number {
  const webMap: WebMapType = {
    qiyi: 1,
    qq: 2,
    youku: 3,
    mgtv: 4,
    bilibili: 5,
    default: 0
  };
  return webMap[playFrom.toLowerCase()] ?? webMap.default;
}

/**
 * 从CMS数据中提取集数
 */
export function extractEpisode(filmData: AppleCMSFilmData): number | null {
  const { vod_total, vod_remarks = "", type_name, type_id } = filmData;

  // 1. 直接返回总集数
  const total = Number(vod_total);
  if (!isNaN(total) && total > 0) return total;

  // 2. 从备注提取（如 "52集全"）
  const match = vod_remarks.match(/(\d+)集/);
  if (match) return Number(match[1]);

  // 3. 电影强制返回0
  if (type_name === "电影" || type_id === 1) return 0;

  // 4. 其他情况未知
  return null;
}

/**
 * 拆分CMS的播放链接为单集数据
 */
export function splitPlayUrls(playUrl: string = "", playFrom: string = ""): EpisodeData[] {
  if (!playUrl) return [];
  const web = matchWebType(playFrom);

  return playUrl.split("#").map((item, index) => {
    const [episodeStr, rawUrl] = item.split("$");
    const source_url = rawUrl?.trim();
    if (!episodeStr || !source_url) return null;

    // 提取集数（兼容 "第1集" / "1" / 缺省）
    const match = episodeStr.match(/(\d+)/);
    const episode = match ? Number(match[1]) : index + 1;

    return { episode, source_url, web };
  }).filter((e): e is EpisodeData => e !== null);
}

/**
 * 提取影片基础数据（所有集共用的字段）
 */
export function extractBaseFilmData(
  filmData: AppleCMSFilmData,
  currentTime: string
): Omit<FilmInsertData, "episode" | "source_url" | "web"> {
  const { vod_name, type_name, vod_pic, vod_pic_thumb, vod_blurb, vod_content } = filmData;

  const categoryMap: Record<string, number> = {
    "电影": 1,
    "电视剧": 2,
    "综艺": 3,
    "动漫": 4
  };

  return {
    title: vod_name || "未知标题",
    category_id: categoryMap[type_name ?? ""] ?? null,
    cover_url: vod_pic || vod_pic_thumb || "",
    description: vod_blurb || vod_content || "暂无简介",
    created_at: currentTime,
    updated_at: currentTime
  };
}
