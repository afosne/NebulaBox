import { Context } from "hono";
import { getFilmDetail } from "../../controllers/films";

// 
export async function getFilmsDetailById(c: Context, id: string) { 
    const result = await getFilmDetail(c, Number(id))
    return { success: true, data: result}
}