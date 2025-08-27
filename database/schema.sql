-- ==========================
-- 开启外键约束
PRAGMA foreign_keys = ON;
-- ==========================

-- 1️⃣ 用户表
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT UNIQUE,
    avatar TEXT,
    role TEXT CHECK(role IN ('admin','member','vip')) DEFAULT 'member', -- 管理员/普通会员/终身VIP
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 用户更新时间触发器（SQLite 兼容语法）
CREATE TRIGGER IF NOT EXISTS users_update_timestamp
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- 初始化用户（避免重复插入）
INSERT OR IGNORE INTO users (username, password, email, role) VALUES
('admin', 'f844cc5c825b76761fda3a4c6ad8127f:9ab4ea7d1c98b740502805e3f93c3350456242482c1d65e5fcc901199e1aa3bf', 'admin@example.com', 'admin'),--admin / admin123 管理员账户
('member1', 'member123', 'member1@example.com', 'member'),
('vip1', 'vip123', 'vip1@example.com', 'vip');

-- ==========================
-- 2️⃣ 分类表
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 分类更新时间触发器
CREATE TRIGGER IF NOT EXISTS categories_update_timestamp
AFTER UPDATE ON categories
FOR EACH ROW
BEGIN
    UPDATE categories SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- 初始化分类
INSERT OR IGNORE INTO categories (name) VALUES
('电影'),
('电视剧'),
('综艺'),
('动漫');

-- ==========================
-- 3️⃣ 影片表
CREATE TABLE IF NOT EXISTS films (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    web INTEGER DEFAULT 0, -- 0未知 1爱奇艺 2腾讯 3优酷 4芒果
    category_id INTEGER,
    cover_url TEXT,
    description TEXT,
    source_url TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 影片更新时间触发器
CREATE TRIGGER IF NOT EXISTS films_update_timestamp
AFTER UPDATE ON films
FOR EACH ROW
BEGIN
    UPDATE films SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- 索引优化（按分类查询影片）
CREATE INDEX IF NOT EXISTS idx_films_category_id ON films(category_id);

-- 初始化影片
INSERT OR IGNORE INTO films (title, web, category_id, cover_url, description, source_url) VALUES
('哪吒', 1, 1, 'https://vcover-vt-pic.puui.qpic.cn/vcover_vt_pic/0/mzc00200tjkzeps1733816869241', '天劫之后，哪吒、敖丙的灵魂虽保住了，但肉身很快会魂飞魄散...', 'https://www.iqiyi.com/v_19rrcuke28.html?vid=6a3e3134537a9500250fca3c6c72089d089d&ischarge=true&vtype=0&ht=2&lt=2&s2=3&s3=pca_115_episode_new&s4=0'),
('哪吒', 2, 1, 'https://vcover-vt-pic.puui.qpic.cn/vcover_vt_pic/0/mzc00200tjkzeps1733816869241', '天劫之后，哪吒、敖丙的灵魂虽保住了，但肉身很快会魂飞魄散...', 'https://v.qq.com/x/cover/mzc00200tjkzeps/y4101qnn3jo.html'),
('哪吒', 3, 1, 'https://vcover-vt-pic.puui.qpic.cn/vcover_vt_pic/0/mzc00200tjkzeps1733816869241', '天劫之后，哪吒、敖丙的灵魂虽保住了，但肉身很快会魂飞魄散...', 'https://www.mgtv.com/b/713367/23281587.html?fpa=se&lastp=so_result'),
('哪吒', 4, 1, 'https://vcover-vt-pic.puui.qpic.cn/vcover_vt_pic/0/mzc00200tjkzeps1733816869241', '天劫之后，哪吒、敖丙的灵魂虽保住了，但肉身很快会魂飞魄散...', 'https://v.youku.com/v_show/id_XNjQ4NTM3ODA4OA==.html?spm=a2hkm.8166622.PhoneSokuProgram_1.dposter&s=cdee9099d49b4137918b');

-- ==========================
-- 4️⃣ 轮播图表
CREATE TABLE IF NOT EXISTS banners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    image_url TEXT,
    link TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 轮播图更新时间触发器
CREATE TRIGGER IF NOT EXISTS banners_update_timestamp
AFTER UPDATE ON banners
FOR EACH ROW
BEGIN
    UPDATE banners SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- 初始化轮播图
INSERT OR IGNORE INTO banners (title, image_url, link) VALUES
('哪吒', 'https://1vimg.hitv.com/100/2508/0117/4410/V2HsGwNr/452890254000508928.jpg', '/films/1');

-- ==========================
-- 5️⃣ 评论表
CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    film_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    status INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (film_id) REFERENCES films(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 评论更新时间触发器
CREATE TRIGGER IF NOT EXISTS comments_update_timestamp
AFTER UPDATE ON comments
FOR EACH ROW
BEGIN
    UPDATE comments SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- 索引优化（按影片/用户查询评论）
CREATE INDEX IF NOT EXISTS idx_comments_film_id ON comments(film_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- 初始化评论
INSERT OR IGNORE INTO comments (film_id, user_id, content) VALUES
(1, 2, '测试评论 1'),
(2, 3, '测试评论 2'),
(3, 2, '电视剧评论 1'),
(3, 3, '动漫评论 1');

-- ==========================
-- 6️⃣ 影视采集 CMS 表
CREATE TABLE IF NOT EXISTS cms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    status INTEGER DEFAULT 0 CHECK(status IN (0,1)), -- 0禁用 1启用
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CMS 更新时间触发器
CREATE TRIGGER IF NOT EXISTS cms_update_timestamp
AFTER UPDATE ON cms
FOR EACH ROW
BEGIN
    UPDATE cms SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- 初始化 CMS 数据
INSERT OR IGNORE INTO cms (name, url, status) VALUES
('金蝉', 'http://zy.jinchancaiji.com/api.php/provide/vod', 0),
('蓝鹿', 'https://zy.jsontv.cloud/api.php/provide/vod', 0),
('七九八', 'https://www.caiji.cyou/api.php/provide/vod', 0),
('火花', 'https://cj.huohua.vip/api.php/provide/vod/?ac=detail&uid=0', 1),
('听风', 'https://gctf.tfdh.top/api.php/provide/vod/?ac=detail', 0);

-- ==========================
-- 7️⃣ 影视解析列表
CREATE TABLE IF NOT EXISTS parsers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    status INTEGER DEFAULT 0 CHECK(status IN (0,1)), -- 0禁用 1启用
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 解析器更新时间触发器
CREATE TRIGGER IF NOT EXISTS parsers_update_timestamp
AFTER UPDATE ON parsers
FOR EACH ROW
BEGIN
    UPDATE parsers SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- 初始化解析器数据
INSERT OR IGNORE INTO parsers (name, url, status) VALUES
('七九八解析', 'https://json.789jiexi.com/?url={url}', 1),
('火花解析', 'https://api.huohua.live/api/?key=oB1yYxpU6HCWwkuQVl&url={url}', 0);

-- ==========================
-- 8️⃣ 弹幕 API 表
CREATE TABLE IF NOT EXISTS danmu (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    status INTEGER DEFAULT 0 CHECK(status IN (0,1)), -- 0禁用 1启用
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 弹幕 API 更新时间触发器
CREATE TRIGGER IF NOT EXISTS danmu_update_timestamp
AFTER UPDATE ON danmu
FOR EACH ROW
BEGIN
    UPDATE danmu SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- 初始化弹幕 API 数据
INSERT OR IGNORE INTO danmu (name, url, status) VALUES
('弹弹play', 'https://api.dandanplay.com/', 1),
('弹幕网', 'https://danmu.huaqi.pro/', 0);

-- ==========================
-- 9️⃣ 会员时间表
CREATE TABLE IF NOT EXISTS memberships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,                    -- 关联用户
    plan INTEGER NOT NULL,                       -- // 0 免费 1 测试会员 2 月付会员 3 季付会员 4 年付会员
    status INTEGER DEFAULT 1 CHECK(status IN (0,1)), -- 0过期 1有效
    start_at DATETIME DEFAULT CURRENT_TIMESTAMP,    -- 开通时间
    end_at DATETIME,                          -- 到期时间
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    UNIQUE(user_id, plan)                     -- 同一用户同一计划不重复
);

-- 会员表更新时间触发器（修复 SET 语法，用 UPDATE 直接更新）
CREATE TRIGGER IF NOT EXISTS memberships_update_timestamp
AFTER UPDATE ON memberships
FOR EACH ROW
BEGIN
    UPDATE memberships SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- ==========================
-- 1️⃣0️⃣ 用户收藏表
CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,               -- 关联用户
    film_id INTEGER NOT NULL,               -- 关联影片
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(film_id) REFERENCES films(id) ON DELETE CASCADE,
    UNIQUE(user_id, film_id)                 -- 避免重复收藏
);

-- 收藏表更新时间触发器（修复 SET 语法）
CREATE TRIGGER IF NOT EXISTS favorites_update_timestamp
AFTER UPDATE ON favorites
FOR EACH ROW
BEGIN
    UPDATE favorites SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- 索引优化（按用户/影片查询收藏）
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_film_id ON favorites(film_id);