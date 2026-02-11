# 分析相关表与视图说明

## 区别

| 名称 | 类型 | 说明 |
|------|------|------|
| **analytics_sessions** | **表** (可写) | 每个访客会话一行，只有基础字段：id, created_at, updated_at, referrer, landing_page, user_agent。前端进站时 INSERT，事件写入 analytics_events。 |
| **analytics_events** | **表** (可写) | 每个行为一行（page_view / click / page_leave / guestbook_submit），通过 session_id 关联会话。 |
| **analytics_sessions_one_row** | **视图** (只读) | 由上面两张表计算得出：每会话一行，多一个 `events` 列，是该会话在 analytics_events 里所有行的 JSON 数组。不额外存数据，只是「查的时候」聚合成一行。 |

所以：**analytics_sessions 是存数据的表；analytics_sessions_one_row 是同一份数据的一种只读展示方式（会话 + 行为合在一行）**，不能把「表」和「视图」混成一个对象。

## 能只留 analytics_sessions_one_row 吗？

**不能。**  
`analytics_sessions_one_row` 是**视图**，不存任何数据，每次查询都是实时从 **analytics_sessions** 和 **analytics_events** 里读再聚合成一行。  
如果删掉 **analytics_sessions**（或 analytics_events），视图就没了数据来源，会报错或查不到任何东西；而且前端现在是在往 **analytics_sessions** 和 **analytics_events** 里**写**数据，必须保留这两张表。  
结论：**必须保留 analytics_sessions 和 analytics_events**；`analytics_sessions_one_row` 只是「看数据的一种方式」，可留可删，不影响存储。

## 能合并吗？

- **视图和表**：不能合并成一个对象，视图不存数据。
- **合并设计**：可以改成「只保留一张会话表，行为都塞进该表的一个 JSON 列里」，这样就不再需要 analytics_events 表，也不需要 analytics_sessions_one_row 视图。见下文的「合并为一张表」迁移脚本。
