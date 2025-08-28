import { Context } from "hono";
import { getFilmDetailByName } from "../../controllers/films";
import { fetchAppleCMSData } from "../../api/cms/apple/fetchAppleCMSData";


const appleCMSApiUrl = "http://zy.jinchancaiji.com/api.php/provide/vod"
export async function getFilmsDetailByName(c: Context, name: string) {
    let film;
    film = await getFilmDetailByName(c, name)
    if (!film) {
        //尝试使用苹果cms查询
        const appleCMSData = await fetchAppleCMSData(appleCMSApiUrl, { ac: "detail", wd: name })
        // 提取有用的信息并提交到数据库
        if (appleCMSData && appleCMSData.data && appleCMSData.data.list && appleCMSData.data.list.length > 0) {
            const listLength = appleCMSData.data.list.length
            for (let i = 0; i < listLength; i++) {
                const filmData = appleCMSData.data.list[i]
                // 判断电影还是剧集
                let episode
                if (filmData.type_name.equals("电影")) episode = 0
            }

        }
        
    }
    return { success: true, data: film }
}
