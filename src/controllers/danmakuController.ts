export const getDanmaku = async (filmId: number) => {
  // 假设调用第三方弹幕 API
  const res = await fetch(`https://danmaku-api.example.com/${filmId}`)
  return res.json()
}
