---
title: "DaD 市场预测 — 7×24 价格管道与 7 日预测"
summary: "自动采集游戏内市场价格进 PostgreSQL，无泄露的特征工程，十个模型加 ARIMA 的集成，给出带置信区间的买卖时机判断。"
category: data
role: "独立开发与分析"
period: "2025.09 – 2025.10"
stack: ["Python", "PostgreSQL", "scikit-learn", "XGBoost", "statsmodels (ARIMA)", "Prophet", "asyncio 调度"]
scale: ["单物品单次运行 6,000+ 条挂单，已去重", "物品类别：矿石、消耗品、装备、材料", "10 个模型 + 投票集成，黄金矿石 R² 0.995", "GitHub 6 star"]
links: { github: "https://github.com/Zhuohengli03/DaD-Market-Forecast" }
featured: true
order: 2
waffle: { source: static, cols: 12, cells: [4,4,3,3,2,2,1,1,4,3,2,1, 3,3,3,2,2,1,1,0,3,2,1,0, 2,2,2,1,1,0,0,0,2,1,0,0] }
gallery:
  - { src: "../../../assets/work/dad-market-forecast/01.png", alt: "分析系统的中英双语终端菜单，列出可用物品并开始拉取数据", caption: "智能模式：选物品（几种矿石加一个自动发现的新物品），拉新数据，再分析。" }
  - { src: "../../../assets/work/dad-market-forecast/02.png", alt: "采集日志：每页 50 条、零重复，连续三页无新数据后自动停止", caption: "采集运行：124 页共 6,164 条新数据；连续三页没有新内容就自动停。" }
  - { src: "../../../assets/work/dad-market-forecast/03.png", alt: "预处理与模型训练日志：异常值移除、特征选择与各模型指标", caption: "移除 139 条异常值，32 个特征选出 15 个，十个模型各报 MAE / RMSE / R² 与交叉验证。" }
  - { src: "../../../assets/work/dad-market-forecast/04.png", alt: "稳定性测试与 ML、ARIMA、统计基线融合的 7 日预测", caption: "三次运行的稳定性测试，然后把 ML、ARIMA 和统计基线融合成一个 7 日区间。" }
  - { src: "../../../assets/work/dad-market-forecast/05.png", alt: "三张图：价格时间序列、价格分布直方图、各模型 R²", caption: "黄金矿石 1 月 20–29 日的价格历史、分布，以及各模型 R²——集成达到 0.995。" }
  - { src: "../../../assets/work/dad-market-forecast/06.png", alt: "历史价格与 7 日预测折线图，含 95% 置信区间和趋势面板", caption: "带 95% 置信区间的 7 日预测与拟合趋势；最后一天区间变宽，就是该等的信号。" }
---

## 问题

《Dark and Darker》里玩家市场的物品价格每小时都在波动。想交易得好，需要知道一个物品的常价、看出什么时候便宜、猜测接下来往哪走。游戏不提供历史——只有当前挂单——所以谁想用数据做决定，就得先把数据集建出来。

## 决策

**先采集，后建模。** 前几周只做接入：每个物品一个 API 采集器，去重、批量写入 PostgreSQL；调度器在中断后能继续跑；连续三页没有新数据就自动停止。没有干净连续的序列，后面所有模型都是猜。

**物品用配置，不用代码。** 物品按类别（矿石、消耗品、装备、材料）写在 `items_config.json`，启用停用不碰 Python；新的 API 文件自动发现。物品清单变了，管道照样跑。

**滞后特征，严格只用过去。** 特征只用预测时刻已有的值（价格滞后、滚动均值、星期几）；管道会报告泄露检查，并做特征筛选抑制过拟合——32 个里留 15 个。偷看未来的预测好看，但会亏钱。

**集成，并把分歧展示出来。** 随机森林、极端随机树、梯度提升、四个线性模型、SVR、MLP 与 XGBoost 投票；预测阶段再融合 ARIMA 和统计基线。输出是带 95% 置信区间的 7 日路径和一句风险提示。区间变宽——比如预测的最后一天——就是该等而不是交易的信号。

## 结果

一条无人值守运行的管道、一个按类别存储挂单的 PostgreSQL 库，以及每日的 7 日预测（趋势、风险等级、买卖建议）。画廊里的黄金矿石这一轮：采集 6,164 条，集成 R² 0.995、无过拟合（交叉验证差 −0.011），结论是"价格呈下降趋势，考虑卖出——高风险"。仓库有 6 个 star 和双语 README；api / database / analysis / scheduler 的结构是我之后新数据项目沿用的骨架。
