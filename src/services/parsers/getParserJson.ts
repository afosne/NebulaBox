import { Context } from "hono";
import { getResourcesById } from "../../controllers/resources";
import { getActiveParsers, getOneParser } from "../../controllers/parsers";

export async function getFilmsParserById(c: Context, id: string) {
    try {
        // 验证ID格式
        const numericId = Number(id);
        if (isNaN(numericId)) {
            return { success: false, data: { code: 400, msg: "无效的ID格式" } };
        }

        // 获取资源信息
        const resource = await getResourcesById(c, numericId);
        if (!resource?.results?.length) {
            return { success: false, data: { code: 404, msg: "未找到指定资源" } };
        }

        const resourceUrl = resource.results[0].resource_url;
        if (typeof resourceUrl !== 'string' || !resourceUrl) {
            return { success: false, data: { code: 400, msg: "资源URL无效" } };
        }

        // 尝试使用指定解析器
        const parser = await getOneParser(c, 1);
        if (parser?.url && typeof parser.url === 'string') {
            const result = await tryParseUrl(parser.url as string, resourceUrl);
            if (result.success) {
                return result;
            }
        }

        // 如果指定解析器失败，尝试所有活跃解析器
        const activeParsers = await getActiveParsers(c);
        if (activeParsers?.results?.length) {
            // 使用for循环正确处理异步操作
            for (const parserItem of activeParsers.results) {
                if (parserItem.url && typeof parserItem.url === 'string') {
                    const result = await tryParseUrl(parserItem.url as string, resourceUrl);
                    if (result.success) {
                        return result;
                    }
                }
            }
        }

        // 所有解析器都失败
        return { 
            success: false, 
            data: { code: 500, msg: "所有解析器均无法解析该资源" } 
        };

    } catch (error) {
        console.error('解析过程发生错误:', error);
        return { 
            success: false, 
            data: { code: 500, msg: "服务器内部错误" } 
        };
    }
}

/**
 * 尝试使用指定的解析器URL解析资源
 */
async function tryParseUrl(parserUrl: string, resourceUrl: string) {
    try {
        // 替换URL中的占位符
        const encodedResourceUrl = encodeURIComponent(resourceUrl);
        const resultUrl = parserUrl.replace('{url}', encodedResourceUrl);
        
        console.log("尝试解析URL:", resultUrl);
        
        // 发起请求
        const response = await fetch(resultUrl);
        if (!response.ok) {
            console.log(`解析失败，HTTP状态码: ${response.status}`);
            return { success: false };
        }

        // 尝试解析响应为JSON（无论Content-Type是什么）
        const data = await response.json();
        
        // 只检查是否存在有效的url
        if (typeof data?.url === 'string' && data.url) {
            return {
                success: true,
                data: {
                    code: 200,
                    msg: "解析成功",
                    url: data.url,
                    from: resourceUrl,
                    web: "福森影视"
                }
            };
        }
        
        console.log("解析响应中未找到有效的url");
        return { success: false };

    } catch (error) {
        console.error('解析URL时发生错误:', error);
        return { success: false };
    }
}
    