import { Context } from "hono";
import { Expiry, generateAccessToken } from "../../utils/token";

export async function refreshToken(c: Context) { 
      const payload = c.get('jwtPayload')
      const userId = payload.id
      const JWT_SECRET = c.env.JWT_SECRET
        const accessToken = await generateAccessToken(
              userId,
              c.env.JWT_SECRET,
              Expiry.AccessToken
          )
          return { success: true, id: userId, accessToken: accessToken } 
}