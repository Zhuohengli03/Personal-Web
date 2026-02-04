# 音乐播放器 · 曲目配置

- **本地音乐**：将音频文件（如 `.mp3`、`.m4a`、`.ogg`、`.wav`）放在本目录下，在 `playlist.json` 中用文件名填写 `src`。
- **线上音乐**：在 `playlist.json` 的 `src` 中填写完整 URL（如 `https://...`）。

## playlist.json 格式

```json
[
  { "src": "我的歌.mp3", "title": "歌名（显示在播放器上）" },
  { "src": "https://example.com/stream.mp3", "title": "在线曲目" }
]
```

- `src`：本地文件名（仅文件名，无需路径）或完整 URL。
- `title`：该曲目在播放器中显示的名称（中英文均可）。

修改后刷新页面即可生效（无需重新构建）。
