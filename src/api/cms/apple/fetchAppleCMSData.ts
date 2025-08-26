import { AppleCMSApiParams } from "./parmas/AppleCMSApiParams";

export async function fetchAppleCMSData(
  apiUrl: string,
  params: AppleCMSApiParams
): Promise<any> {
  // 构建查询参数
  const queryParams = new URLSearchParams();
  
  Object.keys(params).forEach(key => {
    const value = params[key as keyof AppleCMSApiParams];
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });

  const url = `${apiUrl}?${queryParams.toString()}`;
  console.log("构建查询参数: "+ url);
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}