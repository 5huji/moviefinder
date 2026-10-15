# MovieFinder V1.0

在线使用：[MovieFinder](https://5huji.github.io/moviefinder/) · [GitHub 源码](https://github.com/5huji/moviefinder)

已于2026-10-15启用 GitHub Pages：main 分支、根目录、强制 HTTPS。
原生 HTML/CSS/JavaScript 静态影视发现工具。无框架、无后端、无数据库、无运行依赖；按已确认需求使用 Ponytail 最小完整实现规则开发。

## 本地使用
在本目录打开终端：
```sh
python3 -m http.server 8765
```
浏览器访问 http://localhost:8765 。请通过 HTTP 服务打开，直接双击 HTML 可能因浏览器模块安全限制无法加载。

## GitHub Pages 部署
1. 新建 GitHub 仓库，将本目录文件上传到仓库根目录（确保 index.html 位于根目录）。
2. 仓库 Settings → Pages → Build and deployment，Source 选择 Deploy from a branch。
3. Branch 选择 main，目录选择 / (root)，点击 Save。
4. 等待 GitHub 提供站点地址，打开该地址验收。所有资源采用相对路径，支持仓库子路径。

## 功能与筛选口径
- 中英文搜索使用 TMDB 混合搜索，仅展示电影和电视剧；搜索按相关度，榜单按 TMDB 评分降序。
- 六类：战争、科幻、动作、最高评分、美剧、英剧；前四类可切换电影/剧集，后两类固定剧集。
- 电影至少 500 票、剧集至少 200 票；分页加载去重。接口最多支持 500 页。
- 美剧/英剧采用制作地区 US/GB 与原始语言 en；联合制作作品可能出现在两个分类中。
- TMDB 剧集将战争归入 War & Politics、科幻归入 Sci-Fi & Fantasy、动作归入 Action & Adventure；剧集分类因此也包含政治、奇幻、冒险。
- 中文名称缺失回退原名；中文简介缺失时额外查询英文简介，仍缺失显示暂无。
- TMDB 详情与 external_ids 对应准确 IMDb ID，再按需请求 OMDb；首页没有 OMDb 批量请求，同一会话成功取得的补充评分复用。
- 评分缺失显示暂无；OMDb 失败不阻断 TMDB 详情。豆瓣不抓取评分，提供站内搜索链接。
- 请求超时与失败提供提示；榜单和详情旧请求取消，避免快速操作出现旧结果覆盖。

## API 配置与风险
用户提供的两个 Key 已按授权嵌入 core.js。静态前端 Key 对访问者可见，私有仓库也不能隐藏浏览器中的 Key；不要认为这是机密存储。需要隐藏时再改为后端代理，本版不引入后端。
免费接口存在配额与网络可达性限制；OMDb 未收录、超额或授权失效时会显示暂无。浏览器需能访问 api.themoviedb.org、image.tmdb.org 和 `www.omdbapi.com`。

## 测试
Node.js 20+（仅测试需要）：
```sh
node --test tests/*.test.js
```
测试与实际验收结果见 VALIDATION.md。

## 数据来源
- TMDB 官方 API：https://developer.themoviedb.org/reference/discover-movie
- 剧集筛选：https://developer.themoviedb.org/reference/discover-tv
- OMDb 官方 API：https://www.omdbapi.com/

This product uses the TMDB API but is not endorsed or certified by TMDB.
