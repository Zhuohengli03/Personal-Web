# 会话数、设备数、浏览时长 — 文档与实现对照报告

> 依据《会话数、设备数、浏览时长：判定逻辑与计算细节》对当前埋点、数据库与后台计算逻辑的逐项核对结果。

---

## 一、总体结论

**文档描述的是另一套更完整的设计**（前端 `analyticsClient.ts` + Edge Function `/track` + 会话/设备/事件表与视图）。  
**当前仓库实现的是简化版**：直接写 Supabase REST（`analytics_sessions` / `analytics_events`），无 Edge Function、无 `device_id`、无 Visibility 时长、无 `analytics_overview` 等视图。

以下按「文档 vs 实际」逐项对照；✅ 表示与文档一致或等价，❌ 表示不一致或缺失。

---

## 二、会话（Session）

| 文档描述 | 当前实现 | 结论 |
|----------|----------|------|
| **会话定义**：30 分钟内连续访问为同一会话，超时则新会话 | **sessionStorage** 存 `ah_sid`，**无 30 分钟逻辑**；关标签即新会话 | ❌ 不一致 |
| **session_id**：前端生成字符串（`s_` + random + time），localStorage | **服务端生成 UUID**，前端 POST `analytics_sessions` 拿 `id`，存 **sessionStorage** `ah_sid` | ❌ 不一致 |
| **存储键**：`analytics_session_id`、`analytics_session_ts` | `ah_sid`（仅存 UUID） | ❌ 不一致 |
| **会话表**：`session_id`(string), `device_id`, `started_at`, `last_seen_at`, `landing_path`, referrer, utm_* | **id**(uuid), **created_at**, **updated_at**, referrer, **landing_page**, **user_agent**；无 device_id、无 utm | ❌ 不一致 |
| **仅 page_view 时 INSERT 会话行** | **先 INSERT 会话**，再在回调里发 page_view；可能存在「有会话行但无事件」 | ❌ 不一致 |
| **会话数统计**：`COUNT(DISTINCT session_id) WHERE event_type='page_view'`（来自视图） | 后台用 **COUNT(analytics_sessions)** 直接数表 | ⚠️ 口径不同；当前无「仅含 page_view 的 session」过滤 |

**实现位置**：  
- 文档：`src/lib/analyticsClient.ts`（不存在）、Edge Function `track/index.ts`（不存在）  
- 实际：`src/components/Analytics.astro`（会话创建、page_view/click、page_leave 上报）

---

## 三、设备（Device）

| 文档描述 | 当前实现 | 结论 |
|----------|----------|------|
| **device_id**：前端 localStorage，`d_` + random + time | **无 device_id**，无设备维度 | ❌ 缺失 |
| **analytics_devices_dim** 表，首次/末次 seen、ip_hash、device_type、os、browser | 无此表 | ❌ 缺失 |
| **设备数**：`COUNT(DISTINCT device_id) WHERE event_type='page_view'` | 后台 **devices 用 sessions 数代替**（`devices: sessions`） | ❌ 无真实设备数 |

---

## 四、浏览时长（Page Duration）

| 文档描述 | 当前实现 | 结论 |
|----------|----------|------|
| **仅统计「可见」时间**（Visibility API，hidden 不计） | **整页存活时间**：`Date.now() - pageStart`，不区分 visible/hidden | ❌ 不一致 |
| **一次页面生命周期只发一条** duration，在 hidden / pagehide / 卸载时发 | **beforeunload** 时发一条 **page_leave**，metadata 里 `duration_ms` | ⚠️ 事件类型为 `page_leave` 而非 `page_duration`；逻辑上也是「一页一条」 |
| **duration > 500ms 才上报** | 无最小阈值，任意时长都上报 | ❌ 不一致 |
| **事件类型**：`page_duration`，列 `duration_ms` | 事件类型 **page_leave**，时长在 **metadata.duration_ms** | ⚠️ 命名与存储位置不同 |
| **整站平均时长**：单条封顶 30 分钟（视图 LEAST(duration_ms, 1800000)） | 后台 **未实现**「平均时长」KPI；页面指标里从 metadata 取 duration 做 avg | ⚠️ 无整站 30 分钟封顶逻辑 |

**实现位置**：  
- 文档：`src/components/AnalyticsInit.tsx`（不存在）、Visibility + sendDuration + trackPageDuration  
- 实际：`Analytics.astro` 内 `beforeunload`，直接发 `page_leave` + `metadata.duration_ms`

---

## 五、事件类型与去重

| 文档描述 | 当前实现 | 结论 |
|----------|----------|------|
| **事件类型**：page_view, click, **page_duration**, contact_submit | page_view, click, **page_leave**（无 page_duration、无 contact_submit 事件类型） | ⚠️ 用 page_leave 承载时长 |
| **page_view 去重**：同 session+path 30 分钟内只记 1 次（Edge 侧） | 无去重；每次进入页面都会发 page_view | ❌ 无去重 |
| **click 去重**：2 秒内同 IP+element_id 只记 1 次 | 前端 **300ms debounce**，无服务端去重 | ⚠️ 仅前端防抖 |
| **page_duration 无 dedup** | 无 page_duration 事件；page_leave 无 dedup | — |

---

## 六、数据库与视图

| 文档描述 | 当前实现 | 结论 |
|----------|----------|------|
| **analytics_events**：含 `duration_ms` 列、event_type 含 page_duration | **无 duration_ms 列**；时长在 **metadata**；event_type 无 page_duration | ❌ 表结构不同 |
| **analytics_overview** 视图：total_sessions / total_devices 从 events 按 page_view 的 distinct 算 | 无此视图；KPI 来自直接查 **analytics_sessions** 与 **analytics_events** count | ❌ 无视图 |
| **v_daily_traffic_overview**、**v_daily_new_vs_returning_devices** | 无；趋势图由前端查 **analytics_events** 按日聚合 | ❌ 无 |
| **analytics_page_metrics**（按 path 的 avg_duration_ms 等） | 前端 **updatePageMetrics** 从 events 拉全量，按 path 聚合 views/clicks/durations；**仅「浏览量」Tab 有数据**，点击/平均时长 Tab 未切换指标 | ⚠️ 功能部分实现 |
| **analytics_visit_quality**（整站平均时长、30 分钟封顶） | 无 | ❌ 无 |
| **v_device_page_summary** | 无 | ❌ 无 |

---

## 七、常数与配置

| 项 | 文档值 | 当前实现 | 结论 |
|----|--------|----------|------|
| 会话无活动超时 | 30 分钟 | 无（sessionStorage 关标签即丢） | ❌ |
| page_view 去重窗口 | 30 分钟 | 无 | ❌ |
| click 去重 | 2 秒 IP+element_id | 300ms 前端 debounce | ⚠️ |
| duration 最小上报 | 500 ms | 无 | ❌ |
| 整站平均时长单条上限 | 30 分钟 | 未实现 | ❌ |
| device_id / session_id 前缀 | d_ / s_ | 无 device_id；session 为服务端 UUID | ❌ |

---

## 八、当前实现中已对齐或可接受的点

1. **留言转化率**：guestbook 提交时带 `session_id`（当前为 analytics_sessions 的 UUID），与文档「用 session 算转化」思路一致。
2. **漏斗**：STEP1 全部会话 → 访问留言板会话 → 留言会话，数据来源与现有表一致。
3. **按 path 的浏览量/点击**：从 analytics_events 按 event_type、page_path 聚合，逻辑正确。
4. **时长数据来源**：page_leave 的 metadata.duration_ms 被正确用于按 path 的 durations 数组；若后续加「平均时长」Tab 的展示，只需在前端按 tab 切换显示 views / clicks / avg(durations)。

---

## 九、建议（二选一或分阶段）

### A. 以文档为准，改造现有实现（推荐若需要与文档一致）

1. **前端**  
   - 新增 `src/lib/analyticsClient.ts`：实现 30 分钟会话（localStorage `analytics_session_id` / `analytics_session_ts`）、`getDeviceId()`、`postTrack()` 统一走 Edge `/track`。  
   - 用 Visibility API 重写「页面可见时长」逻辑，仅在 visible 累计，hidden/pagehide/卸载时发送一条 `page_duration`（或保留 page_leave 但统一用 duration_ms），且 duration > 500 才发。

2. **后端**  
   - 新增 Edge Function `supabase/functions/track`：接收 body（session_id, device_id, event_type, path, duration_ms 等），写 `analytics_events`；仅当 event_type=page_view 时 INSERT/UPDATE `analytics_sessions`；对 devices 做 `analytics_devices_dim` 的 upsert。  
   - 实现文档中的去重（page_view 30 分钟、click 2 秒）。

3. **数据库**  
   - 迁移：`analytics_sessions` 改为以字符串 `session_id` 为主键或唯一键，并增加 device_id、started_at、last_seen_at、landing_path、utm 等；`analytics_events` 增加 device_id、duration_ms 列，event_type 增加 page_duration、contact_submit。  
   - 新建 `analytics_devices_dim`。  
   - 新建视图：analytics_overview、v_daily_traffic_overview、analytics_page_metrics、analytics_visit_quality 等（与文档 SQL 一致）。

4. **后台**  
   - 会话数/设备数改为从 `analytics_overview`（或等价的「events 中 page_view 的 distinct session_id/device_id」）读取；按页面的平均时长从视图或等效 SQL 读取，整站平均时长做 30 分钟封顶。

### B. 以当前实现为准，仅修正明显问题并更新文档

1. **后台**  
   - 会话数说明改为「analytics_sessions 表行数」；设备数说明为「当前用会话数近似」。  
   - 页面指标中「平均时长」Tab：在 `updatePageMetrics` 中根据当前选中的 tab 显示 views / clicks / avg(durations)，并对空数组做 0 或「-」处理。

2. **可选**  
   - 在 `Analytics.astro` 的 page_leave 中增加 `duration >= 500` 再上报，与文档一致。  
   - 文档另存为「设计稿 / 目标架构」，标明「当前未实现，仅供参考」。

---

若需要，我可以按上述 A 或 B 给出具体改动清单（文件级 + 接口/表结构变更顺序）。
