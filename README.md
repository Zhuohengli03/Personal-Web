# 个人网站

基于 Flask 的简洁个人网站，包含首页、关于、项目展示与联系方式。

## 运行方式

1. 安装依赖：

```bash
pip install -r requirements.txt
```

2. 启动服务：

```bash
python main.py
```

3. 在浏览器打开：<http://127.0.0.1:5000>

## 项目结构

```
├── main.py              # Flask 入口
├── requirements.txt
├── templates/
│   └── index.html       # 首页模板
└── static/
    ├── css/style.css    # 样式
    └── js/main.js       # 脚本
```

## 自定义内容

- **姓名与介绍**：在 `templates/index.html` 中修改「你的名字」、标语和关于我段落。
- **项目**：在「项目与作品」区域编辑或新增 `.project-card`，并填入链接。
- **联系方式**：在「联系我」区域替换邮箱与社交媒体链接。

修改后刷新页面即可看到效果（开发模式下会自动重载）。
