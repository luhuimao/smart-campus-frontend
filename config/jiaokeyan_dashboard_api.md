# 简道云数据列表接口

## 基本信息

| 项目 | 值 |
|------|-----|
| 接口地址 | `https://api.jiandaoyun.com/api/v5/app/entry/data/list` |
| 请求方式 | `POST` |
| Content-Type | `application/json` |
| Authorization | `Bearer <JIANDAOYUN_API_KEY>`（从环境变量读取） |

---

## 请求参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `app_id` | String | 是 | 应用 ID |
| `entry_id` | String | 是 | 表单 ID |
| `data_id` | String | 否 | 分页游标，上一页最后一条数据的 `_id`，首页留空 |
| `fields` | Array | 否 | 需要返回的字段 widget ID 列表，不传则返回全部 |
| `filter` | Object | 否 | 数据筛选器，见下方说明 |
| `limit` | Number | 否 | 每页条数，范围 1–100，默认 10 |

---

## filter 结构

```json
{
  "rel": "and",
  "cond": [
    {
      "field": "_widget_xxx",
      "type": "text",
      "method": "eq",
      "value": ["值"]
    }
  ]
}
```

| 字段 | 说明 |
|------|------|
| `rel` | 条件关系：`"and"` / `"or"` |
| `cond[].field` | widget ID 或系统字段（如 `createTime`、`flowState`） |
| `cond[].type` | 字段类型：`text` / `number` / `date` / `flowstate` 等 |
| `cond[].method` | 操作符：`eq` / `not_empty` / `empty` / `range` 等 |
| `cond[].value` | 过滤值数组，`empty` / `not_empty` 时可省略 |

---

## 分页说明

利用 `data_id` 实现游标分页，避免重复数据：

1. 第一次请求不传 `data_id`，返回前 N 条
2. 取最后一条的 `_id` 作为下次请求的 `data_id`
3. 若返回条数 < `limit`，说明已到最后一页

---

## 请求示例

```json
{
  "app_id": "59264073a2a60c0c08e20bfb",
  "entry_id": "59264073a2a60c0c08e20bfd",
  "data_id": "59e9a2fe283ffa7c11b1ddbf",
  "fields": [
    "_widget_1508400000001",
    "_widget_1508400000002"
  ],
  "filter": {
    "rel": "and",
    "cond": [
      {
        "field": "_widget_1508400000001",
        "type": "text",
        "method": "eq",
        "value": ["2024-2025 第一学期"]
      },
      {
        "field": "createTime",
        "method": "range",
        "value": ["2024-09-01", null]
      }
    ]
  },
  "limit": 100
}
```
