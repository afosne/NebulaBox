import { Context } from "hono";
import { getFilmDetailByName } from "../../controllers/films";
import { fetchAppleCMSData } from "../../api/cms/apple/fetchAppleCMSData";
import { AppleCMSFilmData, EpisodeData, extractBaseFilmData, FilmInsertData, splitPlayUrls } from "./untils/filmUtils";


const appleCMSApiUrl = "http://zy.jinchancaiji.com/api.php/provide/vod"
// export async function getFilmsDetailByName(c: Context, name: string) {
//     let film;
//     film = await getFilmDetailByName(c, name)
//     if (!film || film.length == 0) {
//         //尝试使用苹果cms查询
//         const appleCMSData = await fetchAppleCMSData(appleCMSApiUrl, { ac: "detail", wd: name })
//         console.log("苹果CMS查询:", appleCMSData)
//         // 提取有用的信息并提交到数据库
//         if (appleCMSData && appleCMSData.data && appleCMSData.data.list && appleCMSData.data.list.length > 0) {
//             const listLength = appleCMSData.data.list.length
//             for (let i = 0; i < listLength; i++) {
//                 const filmData = appleCMSData.data.list[i]
//                 // 判断电影还是剧集
//                 let episode
//                 if (filmData.type_name.equals("电影")) episode = 0

//             }
//         }
//     }
//     return { success: true, data: film }
// }

/**
 * 按影片名称查询详情（本地数据库优先，无则调用CMS并插入数据）
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

    // 步骤2：调用CMS接口
    const appleCMSApiUrl = c.env.APPLE_CMS_API_URL || 'http://zy.jinchancaiji.com/api.php/provide/vod';
    const cmsResponse = await fetchAppleCMSData(appleCMSApiUrl, { 
      ac: 'detail', 
      wd: name 
    });

    if (!cmsResponse || cmsResponse.code !== 1 || !cmsResponse.list || !cmsResponse.list.length) {
      console.log(`[CMS无结果] 未找到相关数据`);
      return { success: true, data: [] };
    }

    // 步骤3：处理数据并插入数据库（关键修复）
    const insertedData: any[] = []; // 确保数组初始化
    const cmsFilms: AppleCMSFilmData[] = cmsResponse.list;
    const currentTime = new Date().toISOString();

    for (const film of cmsFilms) {
      const baseData = extractBaseFilmData(film, currentTime);
      const playSources = film.vod_play_from?.split('$$$') || [];
      const playUrls = film.vod_play_url?.split('$$$') || [];

      for (let i = 0; i < playSources.length; i++) {
        const source = playSources[i];
        const url = playUrls[i] || '';
        if (!source || !url) continue;

        // 拆分单集数据
        const episodes: EpisodeData[] = splitPlayUrls(url, source);
        if (episodes.length === 0) continue;

        // 遍历单集插入（修复点：确保每条数据都被收集）
        for (const episode of episodes) {
          const filmData: FilmInsertData = {
            ...baseData,
            ...episode,
            episode: episode.episode
          };

          try {
            // 检查是否已存在
            const existing = await c.env.DB.prepare(
              'SELECT id FROM films WHERE source_url = ?'
            ).bind(filmData.source_url).first();

            if (existing) {
              // 已存在：查询并添加到结果
              const existingFilm = await c.env.DB.prepare(
                'SELECT * FROM films WHERE id = ?'
              ).bind(existing.id).first();
              if (existingFilm) { // 新增：确保查询结果有效
                insertedData.push(existingFilm);
                console.log(`[已存在] 添加到结果: ${filmData.title}`);
              }
            } else {
              // 新数据：插入并添加到结果
              const insertResult = await c.env.DB.prepare(`
                INSERT INTO films (
                  title, episode, web, category_id, cover_url, 
                  description, source_url, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
              `).bind(
                filmData.title,
                filmData.episode,
                filmData.web,
                filmData.category_id,
                filmData.cover_url,
                filmData.description,
                filmData.source_url,
                filmData.created_at,
                filmData.updated_at
              ).run();

              if (insertResult.success && insertResult.lastInsertRowid) {
                const newFilm = await c.env.DB.prepare(
                  'SELECT * FROM films WHERE id = ?'
                ).bind(insertResult.lastInsertRowid).first();
                if (newFilm) { // 新增：确保查询结果有效
                  insertedData.push(newFilm);
                  console.log(`[插入成功] 添加到结果: ${filmData.title}`);
                }
              }
            }
          } catch (dbErr) {
            console.error(`[处理失败] 跳过该数据:`, dbErr);
            continue;
          }
        }
      }
    }

    // 步骤4：返回结果（确保无论如何都返回数组）
    console.log(`[处理完成] 共返回${insertedData.length}条数据`);
    return { 
      success: true, 
      data: insertedData // 即使为空也明确返回
    };

  } catch (error) {
    console.error(`[全局错误]`, error);
    return { success: false, msg: '查询失败，请稍后重试' };
  }
}
