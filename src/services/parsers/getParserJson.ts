import { Context } from "hono"
import { getResourcesById } from "../../controllers/resources"
import { getOneParser } from "../../controllers/parsers"


export async function getFilmsParserById(c: Context, id: string) { 
    const resource = await getResourcesById(c, Number(id))
    const parser = await getOneParser(c, 1)
    const resourceUrl = resource.results[0].resource_url
    if(parser){
        const parserUrl =parser.url
        if (typeof parserUrl === 'string') {
            const resultUrl = parserUrl.replace('{url}', typeof resourceUrl === 'string' ? encodeURIComponent(resourceUrl) : '');
            console.log("resultUrl" , resultUrl)
            const response = await fetch(resultUrl);
            const data = await response.json();
            console.log("获取解析数据成功" , data)
            return { success: true, data :{ code :200 , msg :"解析成功", url : data.url , from : resourceUrl , web: "福森影视" }}
        }
    }

}