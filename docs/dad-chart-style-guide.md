# DaD Market Forecast — 图表与界面美化指南

目标读者：你（重做 Darker Market 项目的输出图和界面），产出会放进 lizhuoheng.com 的案例页。
原则：**用真实数据，不美化截图**；风格和个人站一致——浅底、细线、一种强调色、等宽小字标注。

## 1. 要做哪几张图（按重要性）

| # | 图 | 用什么数据 | 一句话要让人看懂什么 |
|---|---|---|---|
| 1 | 价格历史 + 7 日预测（主图） | `gold_ore.csv` 6,164 条 → 按小时取**中位数**画线；每天的 25–75% 分位画成淡色带；预测 7 点 + 95% 置信区间 | "数据长这样，模型说接下来会这样，而且我知道有多不确定" |
| 2 | 模型对比 | 10 个模型 + 集成的 R² 和交叉验证 R²±σ | "为什么用集成：单模型有的 0.29，集成 0.995 且稳定" |
| 3 | 管道流程图 | 事实 | 采集 → 去重 → 存库 → 清洗 → 特征 → 10 模型 → 集成 → 预测 → 结论，每个节点带数字 |
| 4 | 关键数字条 | 事实 | 6,164 行 · 124 页 · 15/32 特征 · R² 0.995 · CI ±4.63 |

终端截图最多保留两张，放最后当"原始输出"，不再当主视觉。

## 2. 为什么现在的图"像玩具"——以及对应的修法

| 现状 | 问题 | 修法 |
|---|---|---|
| 6,164 个原始点直接连线 | 锯齿、尖峰（300 的离群点）压扁了整张图 | 先按小时聚合中位数，再画；离群点单独用小圆点标注，不进主线 |
| matplotlib 默认蓝 + 红预测 + 绿色文本框 | 三种饱和色互相打架，像默认模板 | 历史用中性灰，预测用一种强调色，区间用强调色 12% 透明度；其余全部灰阶 |
| 标题 "Price Time Series" 居中、全框线、默认网格 | 像教科书作业 | 左对齐小标题 + 一行副标题说明单位和时间范围；只留横向浅灰网格；去掉上/右边框 |
| 图例框、绿色注释框、每个点都标数 | 噪音 | 直接在线末尾标注"Forecast"；只标 2–3 个关键数（最后一个预测值、区间宽度） |
| 四宫格里有一个空白子图 | 明显没整理 | 一张图只回答一个问题；需要几张就几张 |
| 2000×1600 的截图里包含窗口边框 | 不是导出，是截屏 | `savefig(dpi=200, bbox_inches="tight")` 导出，背景白或透明 |

## 3. 样式参数（直接用）

### 配色（已跑过色盲/对比度校验，浅底）

| 用途 | 色值 |
|---|---|
| 历史数据线 | `#6b6866`（中性灰） |
| 预测线 / 强调 | `#0155bf` |
| 置信区间填充 | `#0155bf`，alpha 0.12 |
| 需要第二、第三个系列时（如金矿 vs 铁矿） | `#b45309`（琥珀）、`#0f8a6a`（绿） |
| 网格 | `#e6e6e6` |
| 文字 | `#282828`；次要文字 `#6b6866` |
| 背景 | `#ffffff` |

不要用：红绿表示涨跌以外的东西、彩虹色、渐变、3D、阴影。

### matplotlib 一次性设置

```python
import matplotlib as mpl
mpl.rcParams.update({
    "figure.facecolor": "white", "axes.facecolor": "white",
    "font.family": ["Inter", "Helvetica Neue", "Arial", "sans-serif"],
    "font.size": 10, "axes.titlesize": 12, "axes.titleweight": "medium", "axes.titlelocation": "left",
    "axes.labelsize": 9, "axes.labelcolor": "#6b6866",
    "axes.edgecolor": "#e6e6e6", "axes.linewidth": 0.8,
    "axes.spines.top": False, "axes.spines.right": False,
    "axes.grid": True, "axes.grid.axis": "y", "grid.color": "#e6e6e6", "grid.linewidth": 0.6,
    "xtick.color": "#6b6866", "ytick.color": "#6b6866", "xtick.labelsize": 8.5, "ytick.labelsize": 8.5,
    "xtick.major.size": 0, "ytick.major.size": 0,
    "lines.linewidth": 1.6, "legend.frameon": False, "legend.fontsize": 9,
    "savefig.dpi": 200, "savefig.bbox": "tight", "savefig.pad_inches": 0.2,
})
```

### 主图（价格 + 预测）的画法要点

```python
hourly = df.set_index("created_at")["price_per_unit"].resample("1h").median()
daily_q = df.set_index("created_at")["price_per_unit"].resample("1D").quantile([0.25, 0.75]).unstack()

fig, ax = plt.subplots(figsize=(11, 4.6))
ax.fill_between(daily_q.index, daily_q[0.25], daily_q[0.75], color="#6b6866", alpha=0.10, linewidth=0)   # 日内 25–75%
ax.plot(hourly.index, hourly.values, color="#6b6866", linewidth=1.4)                                      # 小时中位数
ax.fill_between(fc.index, fc.ci_lower, fc.ci_upper, color="#0155bf", alpha=0.12, linewidth=0)           # 95% CI
ax.plot(fc.index, fc.predicted_price, color="#0155bf", linewidth=2, marker="o", markersize=4)            # 预测
ax.axvline(split_time, color="#e6e6e6", linewidth=1, linestyle=(0, (4, 3)))                              # 80/20 分割
ax.annotate("forecast", (fc.index[-1], fc.predicted_price.iloc[-1]), xytext=(8, 0), textcoords="offset points",
            color="#0155bf", fontsize=9, va="center", family="monospace")
ax.set_title("Gold Ore · hourly median price and 7-day forecast")
ax.text(0, 1.02, "Jan 20 – Feb 5, 2026 · price per unit · band = daily 25–75% · shaded = 95% CI",
        transform=ax.transAxes, color="#6b6866", fontsize=8.5)
ax.set_ylim(0, None); ax.margins(x=0.01)
fig.savefig("exhibit-1-forecast.png")
```

### 模型对比图

- 横向条，按 R² 从高到低排序，条高 0.55，颜色 `#c9c7c3`（灰）；**集成一条用 `#0155bf`**
- 每条右端标 R² 两位小数（等宽字体）；交叉验证 R²±σ 用一个小黑点 + 细横线叠在条上
- 不要 y 轴网格；x 轴 0–1

### 流程图

- 用矩形节点（圆角 6px，描边 `#e6e6e6`，无填充），节点内两行：名称 + 等宽小字数字
- 横向排列，箭头细线 1px 灰；最后"结论"节点用强调色描边
- 工具：Figma / Excalidraw（关掉手绘风）/ 直接写 SVG 都行

### 导出规格（给网站用）

- PNG，宽 2200px 左右（dpi 200 × 11 in），白底；或 SVG 更好（`fig.savefig("x.svg")`）
- 图上不要带窗口边框、鼠标、终端提示符
- 文件名：`exhibit-1-forecast`、`exhibit-2-models`、`exhibit-3-pipeline`

## 4. 如果你也想重做 app.py / 前端界面

同一套规则：白底、一种强调色、Inter + 等宽字体、卡片用 `#f4f3f0` 底 + 1px `#e6e6e6` 边、大数字用衬线体；页面只放"今天的预测 + 建议 + 一张主图 + 一张模型对比"，其他折叠。做好后截 1440×900 的干净界面图一张即可。

## 5. 交付给我什么

把导出的图放到 `site/src/assets/work/dad-market-forecast/`（覆盖现有 01–06），文件名用上面的，我负责替换说明文字和版式。如果想让网站上的图能随深色模式换色、能悬停看数值，就把聚合后的数据（小时中位数 + 预测表）存成 CSV/JSON 给我，我在站内用 SVG 重画。
