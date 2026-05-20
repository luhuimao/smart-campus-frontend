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

## 新建单条数据接口
### 示列
```js
const axios = require('axios');
let data = JSON.stringify({
   "app_id": "59264073a2a60c0c08e20bfb",
   "entry_id": "59264073a2a60c0c08e20bfd",
   "data": {
      "_widget_1432728651402": {
         "value": "Saas"
      },
      "_widget_1432728651403": {
         "value": 100
      },
      "_widget_1432728651404": {
         "value": "This saas product is a powerful and easy-to-use tool to build apps. \\nIt can make your ideas come true"
      },
      "_widget_1432728651405": {
         "value": "Option 1"
      },
      "_widget_1432728651406": {
         "value": [
            "Option 1",
            "Option 2",
            "Option 3"
         ]
      },
      "_widget_1432728651407": {
         "value": "2018-01-01T10:10:10.000Z"
      },
      "_widget_1432728651412": {
         "value": {
            "province": "United Kingdom",
            "city": "London",
            "district": "Westminster",
            "detail": "10 Downing Street"
         }
      },
      "_widget_1432728651413": {
         "value": {
            "province": "United Kingdom",
            "city": "London",
            "district": "Westminster",
            "detail": "10 Downing Street",
            "lnglatXY": [
               120.31237,
               31.49099
            ]
         }
      },
      "_widget_1528854613291": {
         "value": [
            {
               "_widget_1528854614409": {
                  "value": "Subform record 1"
               },
               "_widget_1528854615499": {
                  "value": 1001
               }
            },
            {
               "_widget_1528854614410": {
                  "value": "Subform record2"
               },
               "_widget_1528854615419": {
                  "value": 1002
               }
            }
         ]
      },
      "_widget_1652345009097": {
         "value": {
            "phone": "15852540044"
         }
      },
      "_widget_1652345009126": {
         "value": "jian"
      },
      "_widget_1652345009143": {
         "value": [
            "jian",
            "dao"
         ]
      },
      "_widget_1652345009157": {
         "value": 12
      },
      "_widget_1652345009174": {
         "value": [
            12,
            13
         ]
      },
      "_widget_1432728651408": {
         "value": [
            "6b559cf1-b16c-43bd-a211-8fa8fdeae2ef",
            "6b559cf1-b16c-43bd-a211-646ab85da8cb"
         ]
      },
      "_widget_1432728652567": {
         "value": [
            "6b559cf1-b16c-43bd-a211-74389cd8ae76",
            "6b559cf1-b16c-43bd-a211-564e56a65bd6"
         ]
      }
   },
   "data_creator": "",
   "is_start_workflow": false,
   "is_start_trigger": false,
   "transaction_id": "87cd7d71-c6df-4281-9927-469094395677"
});

let config = {
   method: 'post',
   maxBodyLength: Infinity,
   url: 'https://api.jiandaoyun.com/api/v5/app/entry/data/create',
   headers: { 
      'Authorization': 'Bearer <your key>', 
      'Content-Type': 'application/json'
   },
   data : data
};

axios.request(config)
.then((response) => {
   console.log(JSON.stringify(response.data));
})
.catch((error) => {
   console.log(error);
});

```

## 新建多条数据接口
### 示列
```js
const axios = require('axios');
let data = JSON.stringify({
   "app_id": "59264073a2a60c0c08e20bfb",
   "entry_id": "59264073a2a60c0c08e20bfd",
   "data_list": [
      {
         "_widget_1432728651402": {
            "value": "Saas 1"
         },
         "_widget_1432728651403": {
            "value": 100
         },
         "_widget_1528854613291": {
            "value": [
               {
                  "_widget_1528854614409": {
                     "value": "Subform record 11"
                  },
                  "_widget_1528854615499": {
                     "value": 1001
                  }
               },
               {
                  "_widget_1528854614410": {
                     "value": "Subform record 12"
                  },
                  "_widget_1528854615419": {
                     "value": 1002
                  }
               }
            ]
         }
      },
      {
         "_widget_1432728651402": {
            "value": "Saas 2"
         },
         "_widget_1432728651403": {
            "value": 200
         },
         "_widget_1528854613291": {
            "value": [
               {
                  "_widget_1528854614409": {
                     "value": "Subform record 21"
                  },
                  "_widget_1528854615499": {
                     "value": 2001
                  }
               }
            ]
         }
      },
      {
         "_widget_1432728651402": {
            "value": "Saas 3"
         },
         "_widget_1432728651403": {
            "value": 300
         },
         "_widget_1528854613291": {
            "value": [
               {
                  "_widget_1528854614410": {
                     "value": "Subform record 31"
                  },
                  "_widget_1528854615419": {
                     "value": 3001
                  }
               }
            ]
         }
      }
   ],
   "data_creator": "",
   "transaction_id": "87cd7d71-c6df-4281-9927-469094395677",
   "is_start_workflow": true
});

let config = {
   method: 'post',
   maxBodyLength: Infinity,
   url: 'https://api.jiandaoyun.com/api/v5/app/entry/data/batch_create',
   headers: { 
      'Authorization': 'Bearer <your key>', 
      'Content-Type': 'application/json'
   },
   data : data
};

axios.request(config)
.then((response) => {
   console.log(JSON.stringify(response.data));
})
.catch((error) => {
   console.log(error);
});
```

## 修改单条数据接口
### 示列
```js
const axios = require('axios');
let data = JSON.stringify({
   "app_id": "604eb6eea71d720006e1336e",
   "entry_id": "604ecfca8e2ade077c72453a",
   "data_id": "6052e8072315c0075001d65e",
   "data": {
      "_widget_1615777739654": {
         "value": "zhangsan"
      },
      "_widget_1615777739673": {
         "value": [
            {
               "_widget_1615777739744": {
                  "value": "zhangsan"
               }
            },
            {
               "_id": {
                  "value": "606290aba392ca00076da000"
               },
               "_widget_1615777739744": {
                  "value": "lisi"
               }
            },
            {
               "_id": {
                  "value": "606290aba392ca00076da0a9"
               },
               "_widget_1615777739744": {
                  "value": "wangwu"
               }
            }
         ]
      }
   },
   "is_start_trigger": true,
   "transaction_id": "87cd7d71-c6df-4281-9927-469094395677"
});

let config = {
   method: 'post',
   maxBodyLength: Infinity,
   url: 'https://api.jiandaoyun.com/api/v5/app/entry/data/update',
   headers: { 
      'Authorization': 'Bearer <your key>', 
      'Content-Type': 'application/json'
   },
   data : data
};

axios.request(config)
.then((response) => {
   console.log(JSON.stringify(response.data));
})
.catch((error) => {
   console.log(error);
});
```
## 修改多条数据接口
### 示列
```js
const axios = require('axios');
let data = JSON.stringify({
   "app_id": "59264073a2a60c0c08e20bfb",
   "entry_id": "59264073a2a60c0c08e20bfd",
   "data_ids": [
      "200001181fe09728936510eb",
      "200001181fe09728936510ec",
      "200001181fe09728936510ed"
   ],
   "data": {
      "_widget_1432728651402": {
         "value": "Saas 1"
      },
      "_widget_1432728651403": {
         "value": 100
      }
   },
   "transaction_id": "87cd7d71-c6df-4281-9927-469094395677"
});

let config = {
   method: 'post',
   maxBodyLength: Infinity,
   url: 'https://api.jiandaoyun.com/api/v5/app/entry/data/batch_update',
   headers: { 
      'Authorization': 'Bearer <your key>', 
      'Content-Type': 'application/json'
   },
   data : data
};

axios.request(config)
.then((response) => {
   console.log(JSON.stringify(response.data));
})
.catch((error) => {
   console.log(error);
});
```
## 删除单条数据接口
### 示列
```js
const axios = require('axios');
let data = JSON.stringify({
   "app_id": "59264073a2a60c0c08e20bfb",
   "entry_id": "59264073a2a60c0c08e20bfd",
   "data_id": "6052e8072315c0075001d65e",
   "is_start_trigger": false
});

let config = {
   method: 'post',
   maxBodyLength: Infinity,
   url: 'https://api.jiandaoyun.com/api/v5/app/entry/data/delete',
   headers: { 
      'Authorization': 'Bearer <your key>', 
      'Content-Type': 'application/json'
   },
   data : data
};

axios.request(config)
.then((response) => {
   console.log(JSON.stringify(response.data));
})
.catch((error) => {
   console.log(error);
});
```

## 删除多条数据接口
### 示列
```js
const axios = require('axios');
let data = JSON.stringify({
   "app_id": "59264073a2a60c0c08e20bfb",
   "entry_id": "59264073a2a60c0c08e20bfd",
   "data_ids": [
      "200001181fe09728936510eb",
      "200001181fe09728936510ec",
      "200001181fe09728936510ed"
   ]
});

let config = {
   method: 'post',
   maxBodyLength: Infinity,
   url: 'https://api.jiandaoyun.com/api/v5/app/entry/data/batch_delete',
   headers: { 
      'Authorization': 'Bearer <your key>', 
      'Content-Type': 'application/json'
   },
   data : data
};

axios.request(config)
.then((response) => {
   console.log(JSON.stringify(response.data));
})
.catch((error) => {
   console.log(error);
});
```

