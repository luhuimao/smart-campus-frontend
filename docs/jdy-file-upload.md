# 简道云文件上传接入文档

## 上传流程

```
用户选择文件
  → handleSubmit 生成 transaction_id (UUID)
  → jdyUploadFiles(files, app_id, entry_id, transaction_id)
    → jdyGetUploadTokens(app_id, entry_id, count, transaction_id)
      → POST /api/jdy/upload-token  (Next.js 路由代理)
        → POST https://api.jiandaoyun.com/api/v5/app/entry/file/get_upload_token
          请求: { app_id, entry_id, transaction_id }
          响应: { token_and_url_list: [{ url, token }, ...] }
    → 每个文件: POST <url>  (直传七牛云)
        FormData: { file, token }
        响应: { key: "uuid" }
  → buildData() + { 文件字段: [key1, key2, ...] }
  → jdyCreate / jdyUpdate({ data, transaction_id })
```

## 关键约束

| 项目 | 说明 |
|------|------|
| `transaction_id` | UUID 格式，上传和提交必须一致 |
| token 有效期 | 1 小时 |
| key 有效期 | 依赖 transaction_id，同步失效 |
| 一 token 一文件 | `token_and_url_list` 中每个 token 只能上传一个文件，不可复用 |
| 文件字段值格式 | 提交时传 key 数组 `["uuid1", "uuid2"]` |
| 编辑模式 | 不上传新文件时不传文件字段，JDY 保留原值 |

## 相关接口

### 获取上传凭证

```
POST https://api.jiandaoyun.com/api/v5/app/entry/file/get_upload_token
Authorization: Bearer {apiKey}

请求:
{
  "app_id": "68008ff60d080d59b8b67223",
  "entry_id": "6746c6bed047a20b2b7731eb",
  "transaction_id": "87cd7d71-c6df-4281-9927-469094395677"
}

响应:
{
  "token_and_url_list": [
    {
      "url": "https://upload.qiniup.com",
      "token": "IAM-0WcXolsrkVmXepo5BSXTXDc..."
    }
  ]
}
```

### 上传文件

```
POST {token_and_url_list[0].url}   (直传七牛云，不走代理)
Content-Type: multipart/form-data

字段:
  file: <File>
  token: {token_and_url_list[0].token}

响应:
{
  "key": "6b559cf1-b16c-43bd-a211-8fa8fdeae2ef"
}
```

### 提交表单（含文件）

```
POST https://api.jiandaoyun.com/api/v5/app/entry/data/create
Authorization: Bearer {apiKey}

请求:
{
  "app_id": "...",
  "entry_id": "...",
  "transaction_id": "87cd7d71-c6df-4281-9927-469094395677",
  "data_creator": "woxjrqDwAA...",
  "data": {
    "_widget_xxx（照片）": { "value": ["6b559cf1-...", "7c660df2-..."] },
    "_widget_yyy（附件）": { "value": ["646ab85d-..."] }
  }
}
```

## 代码位置

| 文件 | 说明 |
|------|------|
| `src/lib/jdy-api.ts` | `jdyGetUploadTokens`, `jdyUploadFiles` |
| `src/app/api/jdy/upload-token/route.ts` | Next.js 路由代理，转发到简道云 |
| `src/components/ResearchActivityRecordPage.tsx` | 教研活动记录：完整上传示例 |
| `src/components/LessonPrepRecordPage.tsx` | 备课活动记录：参照实现 |
| `src/components/ScienceFestFormPage.tsx` | 科技节活动：参照实现 |
