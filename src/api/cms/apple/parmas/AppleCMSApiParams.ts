export interface AppleCMSApiParams {
  ac?: 'list' | 'detail' | 'videolist' | 'categories';  // 动作类型
  t?: number;                                           // 分类ID
  pg?: number;                                          // 页码       
  wd?: string;                                          // 关键词                 
  ids?: number;                                         // 详情ID                   
  h?: number;                                           // 上传时间                
  limit?: number;                                       // 列表数量    
  uid?: number ;                                        // 设备唯一标识
}