# 离线五子棋 Implementation Plan

**Goal:** 静态 PWA：大厅 + 15×15 自由五子（同设备双人），可悔棋、刷新恢复、断网可玩。

**Architecture:** 纯逻辑在 `src/gomoku/`（已完成）；React 只负责大厅/棋盘 UI 和把点击转成 `place` / `undo` / `createGame`；`localStorage` 存档；`vite-plugin-pwa` 做离线缓存。

**Tech Stack:** Vite, React 19, TypeScript, React Router, Vitest, vite-plugin-pwa

---

## 现状

- [x] `src/gomoku/engine.ts` + `engine.test.ts`：落子、四向五连/长连、悔棋
- [x] `src/gomoku/persist.ts` + `persist.test.ts`：存档、损坏回退、写入失败不抛

## 剩余任务

1. 跑通 `npm test`，确认引擎/存档绿。
2. 大厅 `src/pages/HomePage.tsx`：五子棋可进，跳棋「即将推出」。
3. 五子棋页 `src/pages/GomokuPage.tsx`：木纹 15 路交叉点、最后一手、获胜连线、悔棋/重开、读档。
4. `App.tsx` 路由：`/` 大厅，`/gomoku` 五子棋。
5. 木纹主题样式；替换 Vite 模板页与图标。
6. `vite.config.ts` 接入 PWA（generateSW、navigateFallback、中文 manifest）。
7. `npm test`、`npm run build`，浏览器验证落子/胜负/悔棋/刷新/离线。
