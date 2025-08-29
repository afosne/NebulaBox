import { Context } from "hono";
import { getFilmDetailByName, insertFilm } from "../../controllers/films";
import { fetchAppleCMSData } from "../../api/cms/apple/fetchAppleCMSData";
import { EpisodeData, extractBaseFilmData, extractEpisode, FilmInsertData, matchWebType, splitPlayUrls } from "./untils/filmUtils";
import { insertResources } from "../../controllers/resources";


const appleCMSApiUrl = "http://zy.jinchancaiji.com/api.php/provide/vod"
// https://gctf.tfdh.top/api.php/provide/vod/?ac=list
// https://cj.huohua.vip/api.php/provide/vod/?ac=list
// https://www.caiji.cyou/api.php/provide/vod?ac=list
// 标准化返回


/**
 * 按影片名称查询详情（本地数据库优先，无则调用CMS并插入数据）
 * TODO 待修改 逻辑实现成功 但是代码不规范
 * @param c - Hono上下文（包含数据库连接和环境变量）
 * @param name - 影片名称（支持中文）
 * @returns 标准化响应：{ success: boolean, data?: any[], msg?: string }
 */
export async function getFilmsDetailByName(c: Context, name: string) {
  try {

    // 步骤1：查询本地数据库
    const localFilms = await getFilmDetailByName(c, name);
    if (localFilms && localFilms.length > 0) {
      console.log(`[本地命中] 找到${localFilms.length}条数据`);
      return { success: true, data: localFilms };
    }
    console.log(`[本地未命中] 尝试调用CMS接口`);
    const cmsResponse = await fetchAppleCMSData(appleCMSApiUrl, {
      ac: "detail",
      wd: name
    });

    if (!cmsResponse?.list || cmsResponse.list.length === 0) {
      return { success: false, message: "CMS未返回数据" };
    }

    const currentTime = new Date().toISOString();
    const resultFilms: any[] = [];

    for (const filmData of cmsResponse.list) {
      // 3️⃣ 提取基础影片信息
      const baseData = extractBaseFilmData(filmData, currentTime);
      const totalEpisodes = extractEpisode(filmData);

      // 4️⃣ 拆分播放链接
      const episodes: EpisodeData[] = splitPlayUrls(filmData.vod_play_url || "", filmData.vod_play_from || "");

      // 5️⃣ 写入 films 表（每个集数单独写入，如果是电影只写一次）
      if (episodes.length > 0) {
        for (const ep of episodes) {
          const filmInsert: FilmInsertData = {
            ...baseData,
            class: filmData.type_name,
            episode: ep.episode,
            source_url: ep.source_url,
            web: ep.web
          };
          // 插入 films
          const filmRes = await insertFilm(c, filmInsert)

          const filmId = filmRes.meta.last_row_id;

          await insertResources(c, filmId, ep.source_url, ep.web, 1, currentTime, currentTime)
          const pushFilm = {
            id: filmId,
            title: filmInsert.title,
            episode: filmInsert.episode,
            category_id: filmInsert.category_id,
            class: filmInsert.class,
            cover_url: filmInsert.cover_url,
            description: filmInsert.description,
            created_at: filmInsert.created_at,
            updated_at: filmInsert.updated_at
          }

          resultFilms.push({ ...pushFilm });
        }
      } else {
        // 电影或没有拆分的单集
        const filmInsert: FilmInsertData = {
          ...baseData,
          episode: totalEpisodes !== null ? totalEpisodes : 0,
          source_url: filmData.vod_play_url || "",
          web: matchWebType(filmData.vod_play_from || "")
        };

        const filmRes = await insertFilm(c, filmInsert)

        const filmId = filmRes.meta.last_row_id;

        await insertResources(c, filmId, filmInsert.source_url, filmInsert.web, 1, currentTime, currentTime)


        // 应该和  await getFilmDetailByName(c, name); 中的数据结构一致
        const pushFilm = {
          id: filmId,
          title: filmInsert.title,
          episode: filmInsert.episode,
          category_id: filmInsert.category_id,
          class: filmInsert.class,
          cover_url: filmInsert.cover_url,
          description: filmInsert.description,
          created_at: filmInsert.created_at,
          updated_at: filmInsert.updated_at
        }

        resultFilms.push({ ...pushFilm });
      }
    }

    console.log(`[CMS写入完成] 共写入${resultFilms.length}条影片数据`);

    return { success: true, data: resultFilms };
  } catch (error) {
    console.error("[影片获取/写入出错]", error);
    return { success: false, message: "获取影片详情失败" };
  }
}
