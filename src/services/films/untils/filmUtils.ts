/**
 * 影片数据处理工具函数
 * 功能：处理苹果CMS返回数据，转换为本地数据库兼容格式
 */

// ========================== 类型定义 ==========================
/** 播放源与films表web字段的映射类型 */
export type WebMapType = {
  qiyi: number;
  qq: number;
  youku: number;
  mgtv: number;
  bilibili: number;
  [key: string]: number; // 兼容未定义的播放源
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
  [key: string]: any; // 兼容其他字段
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
 * @param playFrom - CMS返回的播放源标识（如"qiyi"、"qq"）
 * @returns 对应的web字段值（0未知 1爱奇艺 2腾讯 3优酷 4芒果）
 */
export function matchWebType(playFrom: string): number {
  const webMap: WebMapType = {
    "qiyi": 1,
    "qq": 2,
    "youku": 3,
    "mgtv": 4,
    "bilibili": 0,
    "default": 0
  };
  return webMap[playFrom.toLowerCase()] || webMap["default"];
}

/**
 * 从CMS数据中提取集数
 * @param filmData - CMS返回的单条影片数据
 * @returns 集数（优先用vod_total，其次用vod_remarks，电影默认0，其他返回null）
 */
export function extractEpisode(filmData: AppleCMSFilmData): number | null {
  // 1. 优先用CMS直接返回的总集数
  if (filmData.vod_total !== undefined && filmData.vod_total !== "" && !isNaN(Number(filmData.vod_total))) {
    return Number(filmData.vod_total);
  }

  // 2. 从备注中提取（如"52集全"）
  const remarks = filmData.vod_remarks || "";
  const episodeMatch = remarks.match(/(\d+)集/);
  if (episodeMatch && episodeMatch[1]) {
    return Number(episodeMatch[1]);
  }

  // 3. 电影类型强制返回0
  if (filmData.type_name === "电影" || filmData.type_id === 1) {
    return 0;
  }

  // 4. 其他情况返回null（未知集数）
  return null;
}

/**
 * 拆分CMS的播放链接为单集数据
 * @param playUrl - CMS返回的vod_play_url（格式："第1集$url#第2集$url"）
 * @param playFrom - 对应的播放源（用于匹配web字段）
 * @returns 单集数据列表（EpisodeData[]）
 */
export function splitPlayUrls(playUrl: string, playFrom: string): EpisodeData[] {
  const web = matchWebType(playFrom);
  const episodeUrls: EpisodeData[] = [];
  const playItems = playUrl.split("#"); // 按"#"分割不同集

  for (const item of playItems) {
    const [episodeStr, sourceUrl] = item.split("$"); // 按"$"分割集数与链接
    
    // 跳过格式错误的项（无集数或无链接）
    if (!episodeStr || !sourceUrl || sourceUrl.trim() === "") continue;

    // 提取集数（兼容"第1集"或"1"两种格式）
    const episodeMatch = episodeStr.match(/(\d+)/);
    if (!episodeMatch) continue;

    // 如果提取集数失败 则通过索引获取集数
    const episodeIndex = playItems.indexOf(item);

    const episode = Number(episodeMatch[1]);
    episodeUrls.push({
      episode,
      source_url: sourceUrl.trim(), // 去除链接前后空格
      web
    });
  }

  return episodeUrls;
}

/**
 * 提取影片基础数据（所有集共用的字段）
 * @param filmData - CMS返回的单条影片数据
 * @param currentTime - 当前时间（ISO格式字符串）
 * @returns 基础数据对象（不含单集专属字段）
 */
export function extractBaseFilmData(
  filmData: AppleCMSFilmData,
  currentTime: string
): Omit<FilmInsertData, "episode" | "source_url" | "web"> {
  return {
    title: filmData.vod_name || "未知标题",
    category_id: filmData.type_name === "电影" ? 1 
               : filmData.type_name === "电视剧" ? 2
               : filmData.type_name === "综艺" ? 3
               : filmData.type_name === "动漫" ? 4
               : null,
    cover_url: filmData.vod_pic || filmData.vod_pic_thumb || "",
    description: filmData.vod_blurb || filmData.vod_content || "暂无简介",
    created_at: currentTime,
    updated_at: currentTime
    // 移除了episode属性，因为它已被Omit排除
  };
}