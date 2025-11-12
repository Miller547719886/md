# 私有化微信公众号编辑器草稿与发布

这是基于 https://github.com/doocs/md 改造的私有化部署版的微信公众号文章编辑器。目前需要在原版的基础上做一键发布草稿和正式发布的功能，并扩展为“公众号文章管理平台”。

## 更新

### 2025-11-12

1. 增加素材模块相关页面需求和对应接口
2. 基础接口增加“查询rid信息”和“使用AppSecret重置API调用次数”
3. 下掉发布，增加保存草稿
4. 上传图片组件禁用部分平台

## 执行待办清单（Roadmap）

1. 路由与布局
   - 引入 `vue-router`，新增主布局（左侧菜单：草稿箱/发表记录；右侧内容区）。
   - 路由：`/` 欢迎页、`/drafts` 草稿列表、`/drafts/:id?` 草稿编辑、`/publishes` 发布列表、`/publishes/:id` 发布详情。
2. 草稿模块（阶段一：Mock）
   - 草稿列表四列卡片、删除按钮、第一位“新的创作”卡片。
   - 草稿编辑页复用现有编辑器；从 URL 读取参数，无参则新建草稿。
3. 发布模块（阶段一：Mock）
   - 发布列表与详情页骨架，支持从列表跳转详情渲染正文。
4. 接口与配置（阶段二：联调）

- 抽象 API 客户端：`getStableAccessToken`、草稿增删改查、发布提交/查询/删除。
- 已新增前端骨架：`apps/web/src/services/wechat.ts`（通过 `VITE_WECHAT_*` 环境变量配置，默认指向代理域）。
- 配置：`WECHAT_APP_ID`、`WECHAT_APP_SECRET`、接口基址；本地 `.env.local`（忽略提交）。
- Token 缓存与过期刷新；基础错误处理与提示。

5. 编辑器改造
   - 发布弹窗删除插件检测逻辑；“确定”直接调用“发布草稿”接口。
6. 完成联调与打磨
   - 将草稿/发布列表切换为真实数据；补 loading/空态/失败态；最小化权限校验。
7. 文档与演示
   - 更新 `README`/`AGENTS.md` 使用说明与开发命令，录制基础流演示。

## 用户故事

### 首页

经典菜单栏目布局，左侧菜单栏提供两菜单：

1. 草稿箱（对应草稿模块）
2. 发表记录（对应发布模块）

右侧仅展示一条欢迎文案：欢迎使用生涯重塑公众号专用文章编辑器！

### 素材模块

通过首页左侧菜单栏点击”素材库“进入，目前仅支持图片类型素材的管理，音频和视频不考虑。
分组功能目前不考虑

#### 素材列表页面

整体样式和内容参考微信官方页面，细节如下：
在项目中增加草稿列表页面作为“草稿箱”入口页面。六列布局展示图片，卡片展示内容包括标题和发布时间，点击草稿卡片跳转到草稿编辑页面，草稿相关数据通过url传参传递。
卡片宽高参考：200px \* 200 px
卡片布局：上下布局，上面是图片预览，下面是图片名称
每个素材卡片提供删除按钮，点击删除草稿
增加“上传素材”卡片，在六列布局的第一行第一列，点击则打开图片上传弹窗。组件直接使用项目中已有的 apps/web/src/components/CodemirrorEditor/UploadImgDialog.vue。

### 草稿模块

通过首页左侧菜单栏点击”草稿箱“进入

#### 草稿列表页面

整体样式和内容参考微信官方页面，细节如下：
在项目中增加草稿列表页面作为“草稿箱”入口页面。四列布局展示草稿卡片，卡片展示内容包括标题和发布时间，点击草稿卡片跳转到草稿编辑页面，草稿相关数据通过url传参传递。
草稿提供删除按钮，点击删除草稿
增加“新的创作”卡片，在四列布局的第一行第一列，点击则新增一个草稿。

#### 草稿新增、编辑页面

即当前入口页面，改造为草稿新增、编辑页面，默认读取页面url中的草稿参数获取详情，如果没有参数则默认为新建草稿，使用当前的默认内容作为模板。
布局沿用当前的即可。改造功能点如下：

1. 保存草稿：文章编辑器页面在“发布”按钮左侧增加一个“保存草稿”的按钮，新增草稿页面调用新增草稿接口，编辑草稿页面调用编辑草稿接口。
2. 由于绑定的公众号不是企业认证公众号，无法使用 api 进行发布，因此禁用发布按钮，鼠标悬浮提示文案：“受微信官方规则限制，个人认证的公众号无法通过 api 进行发布，请到官方平台发布草稿。地址：https://mp.weixin.qq.com/cgi-bin/appmsg”
3. apps/web/src/components/CodemirrorEditor/UploadImgDialog.vue 是图片上传组件，目前只有公众号图床可用，默认放在第一个，并禁用其他图床按钮，鼠标悬浮展示提示文案：“暂时不可用”

### 发布模块

通过首页左侧菜单栏点击”发表记录“进入

#### 发布列表

入口页面展示发布文章列表，点击列表项目查看文章详情，url 传参提供发布文章信息

#### 发布文章详情

通过发布文章列表页面点击进入，渲染文章详情。

## AppID与AppSecret

AppID: wxd7ab5c47c6af8afc
AppSecret: 0b13d51ce03d8e53011bb078a6c2b640

## ip 白名单配置

已配置如下 ip 白名单：
43.142.191.118
43.160.246.9
140.143.142.169

## 接口文档

### 接口调用指南

#### 请求参数

大部分服务端 API 的请求方法为 POST 和 GET，对于接口参数，有固定的规范：

对于 GET 请求，请求参数应以 QueryString 的形式写在 URL 中。
对于 POST 请求，部分参数需以 QueryString 的形式写在 URL 中（一般只有 access_token，如有额外参数会在文档里的 URL 中体现），其他参数如无特殊说明均以 JSON 字符串格式写在 POST 请求的 body 中。

#### 返回参数

返回参数格式在各个接口文档中都有详细介绍，如果接口调用失败时，会固定返回 errcode 和 errmsg 标明错误内容。错误码可参考

### 基础接口

用于获取 accessToken，以及检测网络条件。

获取稳定版接口调用凭据：https://developers.weixin.qq.com/doc/service/api/base/api_getstableaccesstoken.html
网络通信检测：https://developers.weixin.qq.com/doc/service/api/base/api_callbackcheck.html
查询rid信息：https://developers.weixin.qq.com/doc/service/api/apimanage/api_getridinfo.html
使用AppSecret重置API调用次数：https://developers.weixin.qq.com/doc/service/api/apimanage/api_clearquotabyappsecret.html

### 草稿管理

用于获取草稿列表、新增、编辑、删除草稿

新增草稿：https://developers.weixin.qq.com/doc/service/api/draftbox/draftmanage/api_draft_add.html
更新草稿：https://developers.weixin.qq.com/doc/service/api/draftbox/draftmanage/api_draft_update.html
获取草稿列表：https://developers.weixin.qq.com/doc/service/api/draftbox/draftmanage/api_draft_batchget.html
删除草稿：https://developers.weixin.qq.com/doc/service/api/draftbox/draftmanage/api_draft_delete.html
获取草稿详情：https://developers.weixin.qq.com/doc/service/api/draftbox/draftmanage/api_getdraft.html

### 发布能力

目前个人认证的微信公众号暂不支持api发布草稿

获取已发布的消息列表：https://developers.weixin.qq.com/doc/service/api/public/api_freepublish_batchget.html
删除发布文章：https://developers.weixin.qq.com/doc/service/api/public/api_freepublishdelete.html
获取已发布图文信息：https://developers.weixin.qq.com/doc/service/api/public/api_freepublishgetarticle.html
发布草稿：https://developers.weixin.qq.com/doc/service/api/public/api_freepublish_submit.html

### 素材管理

获取永久素材：https://developers.weixin.qq.com/doc/service/api/material/permanent/api_getmaterial.html
获取永久素材总数：https://developers.weixin.qq.com/doc/service/api/material/permanent/api_getmaterialcount.html
获取永久素材列表：https://developers.weixin.qq.com/doc/service/api/material/permanent/api_batchgetmaterial.html
上传图文消息图片：https://developers.weixin.qq.com/doc/service/api/material/permanent/api_uploadimage.html
上传永久素材：https://developers.weixin.qq.com/doc/service/api/material/permanent/api_addmaterial.html
删除永久素材：https://developers.weixin.qq.com/doc/service/api/material/permanent/api_delmaterial.html
