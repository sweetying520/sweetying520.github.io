# sweetying 的个人博客

站点：[sweetying520.github.io](https://sweetying520.github.io/)  
仓库：[sweetying520/sweetying520.github.io](https://github.com/sweetying520/sweetying520.github.io)

源码保存在 `source` 分支，原 `master` 分支保留网页发布历史。文章、配置和定制资源均跟随源码保存；Fluid 使用锁定的 npm 包，没有需要单独初始化的主题子模块。

## 本地运行

使用 Node.js **24.14.1**（见 `.nvmrc`），然后执行：

```bash
git clone --branch source git@github.com:sweetying520/sweetying520.github.io.git hexo-blog
cd hexo-blog
npm ci --ignore-scripts
npm run server
```

本地预览地址为 <http://127.0.0.1:4000/>。预览额外加载 `_config.preview.yml`，关闭评论及统计，避免本地阅读影响线上数据。生产构建使用正常配置。

## 写文章

```bash
npx hexo new post "文章标题"
npx hexo new draft "还没写完的文章"
npm run server -- --draft
npx hexo publish "还没写完的文章"
```

文章在 `source/_posts/`，草稿在 `source/_drafts/`，图片可以放在 `source/img/blog/`。`hexo publish` 只把草稿转为文章，不会推送网站。

```yaml
---
title: 文章标题
date: 2026-09-17 10:00:00
author: sweetying
index_img: /img/default.png
categories:
  - Android
tags:
  - 原创
  - Android
---
```

旧文的文件名/slug、日期会影响地址，评论按 pathname 关联。整理旧文时保留这些字段；正文更新可以填写独立的 `updated`。`docs/legacy-post-routes.json` 保存维护前的 105 个地址，构建检查会发现意外丢失。

## 保存源码和发布

```bash
npm run verify
git add <需要保存的文件>
git commit -m "更新博客文章"
git push origin source
```

上述推送只触发构建检查，默认不会发布。`npm run verify` 检查私密凭据、重新构建、核对历史地址、核心页面、资源引用及重复 jQuery/Banner。

原有 SSH 手动发布仍可用：`npm run deploy` 会先完整验证，再把静态文件发布到远程 `master`。这会改变线上站点，并使用 Hexo 部署插件更新发布分支，确认预览后再执行。不要在 `master` 保存源码。

如果改用 GitHub Actions 自动发布，需要在 GitHub 完成一次设置：

1. 将仓库默认分支改为 `source`，让工作流的手动运行入口与 Dependabot 配置可用。此操作不会删除 `master`。
2. Settings → Pages → Build and deployment → Source 选择 **GitHub Actions**。
3. 检查 `github-pages` Environment 允许 `source` 分支部署。
4. 在 Actions 中手动运行 **Blog build and Pages**，选择 `source`，勾选 `publish`，验证首次发布。
5. 验证后，在 Settings → Secrets and variables → Actions → Variables 增加 `AUTO_DEPLOY=true`，以后的 `source` 推送便自动发布。

工作流使用 GitHub 自动提供的短期 Token，不需要把个人 Token 写入配置。自动发布启用后，使用 Actions 作为日常发布方式，不再混用手动推送 `master`。

参考：[Hexo GitHub Pages 文档](https://hexo.io/docs/github-pages)、[GitHub 官方 deploy-pages](https://github.com/actions/deploy-pages)。

## 常改的文件

| 文件 | 用途 |
| --- | --- |
| `_config.yml` | 站名、网址、地址规则、部署目标、时区 |
| `_config.fluid.yml` | 主题个性化覆盖、评论、导航、友链、封面 |
| `source/about/index.md` | 个人介绍 |
| `source/css/` | 自定义样式 |
| `scripts/page.js`、`source/_inject/` | 主题注入，避免修改 npm 主题源码 |
| `source/vvd_js/` | 音乐、运行时间、星空效果 |
| `source/live2d-widget/` | 从旧主题迁出的 Live2D 资源与许可证 |
| `tools/sync-vendor.mjs` | 从锁定 npm 包生成本地 jQuery，构建和预览时自动运行 |

视频背景原服务器不可用时采用本地 `source/img/default.png`。视频入口保留：在 `source/vvd_js/video_url.json` 填入 `[["https://视频地址", "https://封面地址"]]`，再启用 `_config.fluid.yml` 中的 `site_extras.video_background`。手机、减少动态效果偏好以及视频加载失败时保留静态背景。Live2D 可用 `site_extras.live2d` 开关。

## 维护注意事项

- 已移除历史遗留的 GitHub Token；旧 Token 的账号侧撤销需由账号所有者完成。
- 新源码分支从清理后的完整工作区创建，旧主工程和主题 Git 历史保存在本地维护前备份中，不混入新分支。
- 评论与统计沿用原 LeanCloud 客户端配置，未迁移或删除数据。本地预览关闭这些服务。
- `source/_posts/一篇就够系列：沉浸式状态栏完全解析.md` 仍是提纲，现已明确标注，保留旧地址。
- 正文外链图床仍然保留；`picgo` 仓库应和博客源码一起备份。
- `public/`、`db.json`、`node_modules/`、`.deploy_git/` 与生成的 `source/vendor/` 不提交。
- 升级依赖后保留 `package-lock.json`，运行 `npm ci --ignore-scripts`、`npm run verify`，再检查桌面和手机页面。
