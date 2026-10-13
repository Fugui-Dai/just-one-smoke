# 大厂规范化项目结构重构与体验优化实施计划 (Big Tech Project Structure & Architecture Refactor Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有微信小程序架构按照腾讯大厂标准进行领域分层重构（拆解膨胀的 `utils/` 为 `engine/` 渲染与物理引擎、`services/` 业务领域服务、`configs/` 配置模型、`utils/` 纯工具库），清理冗余死组件，并修复自检发现的烟价设置入口与神品勋章解锁闭环，确保 100% 向后兼容且功能零故障。

**Architecture:** 
1. **分层清晰解耦**：将 23 个平铺的工具文件归类重组至 `engine/`、`services/`、`configs/` 与 `utils/`，并在原 `utils/` 保留兼容性重导出（Re-export shims），保证所有历史相对引用 0 风险。
2. **清理冗余死代码**：安全移除未使用的废弃占位目录 `components/collection-view` 与 `components/navigation-bar`。
3. **修复自检体验断层**：在 `stats-view` 中为「吸烟偏好设置（烟价/习惯）」添加高质感交互触发入口；完善 `achievements.js` 与 `stats-view.js` 的神品烟雾特效勋章解锁判定；对齐 `pages/pack` 与 `pages/shop` 的防连击与防重复导航互斥锁。

**Tech Stack:** 原生微信小程序 (WXML / WXSS / JavaScript ES6+ / Canvas 2D 硬件加速)

**Spec:** 本次重构遵循腾讯 CDC / TGideas 规范与 `GEMINI.md` 铁律（严禁自动 git commit/push、严禁新增测试文件与运行校验脚本、保持 33 款烟盒视觉规范）。

## Global Constraints
- 严禁执行 `git commit` 和 `git push`（必须且只能由用户在终端执行）。
- 严禁新增任何测试文件或测试脚本（如 `test_*.js`、`*.test.js`）。
- 严禁破坏现有业务逻辑、页面路由与数据存储格式（`storageService` 键名 100% 保持不变）。
- 在 `utils/` 保留同名转发文件，双重兜底确保全工程无论按新路径还是老路径引用皆 100% 畅通。

---

### Task 1: 建立大厂标准分层架构目录并迁移配置与领域服务

**Files:**
- Create: `configs/catalog.js`
- Create: `configs/smokeEffects.js`
- Create: `configs/achievements.js`
- Create: `configs/healthCalculator.js`
- Create: `services/storageService.js`
- Create: `services/vipService.js`
- Create: `services/audioManager.js`
- Create: `services/ignitionService.js`
- Create: `services/leaderboardService.js`
- Create: `services/toastService.js`
- Create: `services/haptics.js`
- Modify: 原 `utils/*.js` 对应文件配置代理转发（保证 100% 兼容）

- [x] **Step 1: 迁移配置与元数据模型至 `configs/`**
  - 将 `utils/catalog.js`、`utils/smokeEffects.js`、`utils/achievements.js`、`utils/healthCalculator.js` 迁移至 `configs/`，调整其相对导入。
- [x] **Step 2: 迁移业务服务至 `services/`**
  - 将 `utils/storageService.js`、`utils/vipService.js`、`utils/audioManager.js`、`utils/ignitionService.js`、`utils/leaderboardService.js`、`utils/toastService.js`、`utils/haptics.js` 迁移至 `services/`。
- [x] **Step 3: 在 `utils/` 建立无缝重导出桥接层**
  - 为上述所有迁移文件在 `utils/` 中创建对应桥接转发代码，确保现有代码即使未改动 import 也能零报错正常运行。

---

### Task 2: 迁移渲染与物理引擎至 `engine/` 目录

**Files:**
- Create: `engine/canvasRenderer.js`
- Create: `engine/particleSystem.js`
- Create: `engine/smokeStateMachine.js`
- Create: `engine/sceneRenderer.js`
- Create: `engine/renderers/dragonRenderer.js`
- Create: `engine/renderers/phoenixRenderer.js`
- Create: `engine/renderers/baguaRenderer.js`
- Create: `engine/renderers/buddhaRenderer.js`
- Create: `engine/renderers/wordRiverRenderer.js`
- Modify: `utils/` 中对应文件保留转发桥接

- [x] **Step 1: 迁移 Canvas 渲染器与独立图腾实体至 `engine/`**
  - 创建 `engine/` 与 `engine/renderers/` 目录。
  - 将 `dragonRenderer.js`、`phoenixRenderer.js`、`baguaRenderer.js`、`buddhaRenderer.js`、`wordRiverRenderer.js` 迁移至 `engine/renderers/`。
  - 将 `canvasRenderer.js`、`particleSystem.js`、`smokeStateMachine.js`、`sceneRenderer.js` 迁移至 `engine/`。
- [x] **Step 2: 维护 `utils/` 桥接转发层**
  - 在 `utils/` 保留对应模块的导出转发，保持历史引用全兼容。

---

### Task 3: 清理冗余死代码组件并更新核心模块 import 引用

**Files:**
- Delete: `components/collection-view/` 目录及空文件
- Delete: `components/navigation-bar/` 目录及空文件
- Modify: `pages/index/index.js`
- Modify: `pages/shop/shop.js`
- Modify: `pages/pack/pack.js`
- Modify: `pages/vip/vip.js`
- Modify: `pages/mine/mine.js`
- Modify: `pages/leaderboard/leaderboard.js`
- Modify: `components/stats-view/stats-view.js`
- Modify: `components/leaderboard-view/leaderboard-view.js`

- [x] **Step 1: 删除废弃空组件目录**
  - 清理 `components/collection-view/` 与 `components/navigation-bar/`。
- [x] **Step 2: 更新各页面与组件的 import 路径至大厂标准目录**
  - 更新引用为明确的 `../../engine/*`、`../../services/*`、`../../configs/*`，展现工业级分层架构。

---

### Task 4: 修复体验断层（烟价设置入口 + 神品特效勋章解锁 + 3D防连击锁）

**Files:**
- Modify: `components/stats-view/stats-view.wxml`
- Modify: `components/stats-view/stats-view.wxss`
- Modify: `components/stats-view/stats-view.js`
- Modify: `configs/achievements.js`
- Modify: `pages/index/index.js`
- Modify: `pages/pack/pack.js`

- [x] **Step 1: 在 `stats-view.wxml` 中加入「⚙️ 设置烟价」入口**
  - 在钱包「自律存钱罐」卡片右上角或公式底部说明条旁，增加精致的高定微胶囊按钮，绑定 `bindtap="onOpenProfileModal"`，打通用户修改烟价与吸烟习惯的链路。
- [x] **Step 2: 完善神品烟雾特效与勋章点亮闭环**
  - 在 `index.js` 切换/装配神品特效（神龙、神凰、佛光、八卦）时，同步登记至 `unlockedEffects`，并在抽吸完成与 `stats-view` 中统一判定逻辑，确保「赛博玩家 · 龙凤呈祥」勋章能正常解锁。
- [x] **Step 3: 为 `pages/pack/pack.js` 补齐 `_isPullingInProgress` 与 `_isNavigatingBack` 互斥保护**
  - 彻底杜绝快速连击导致的多次触发与导航动画错乱。

---

### Task 5: 整体代码审查与工程洁净度自检 (Verification)

**Files:**
- Review: `app.json`
- Review: `git status`

- [x] **Step 1: 审查所有页面分包与组件引用**
  - 确认所有页面在无报错情况下直出，无丢失组件或模块报错。
- [x] **Step 2: 清理 Python 字节码缓存**
  - 从 git 跟踪中移除 `scripts/__pycache__/`，并将其加入 `.gitignore`。
- [x] **Step 3: 运行 `git status` 呈现代码变更清单**
  - 供用户核对审查，坚决不越权执行 commit / push。
