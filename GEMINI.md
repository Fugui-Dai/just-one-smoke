# 项目开发规范与 AI 行为准则 (Project Rules & AI Guidelines)

## 🚨 Git 版本控制绝对铁律 (Strict Git Safety Rules)

1. **严禁 AI 自动执行 `git commit`**
   - AI 编程助手在任何场景、任何阶段、以任何理由，**绝对禁止**擅自执行 `git commit` 命令。
   - 严禁通过终端、后台任务或脚本等任何方式自动提交代码。

2. **严禁 AI 自动执行 `git push`**
   - AI 编程助手**绝对禁止**擅自执行 `git push` 命令，严禁向任何本地分支或远程仓库推送代码。

3. **提交与推送权限归属**
   - **必须且只能由用户本人亲自执行 `git commit` 和 `git push`**。
   - AI 助手在完成代码编写与完整性验证后，只负责客观清晰地汇报修改文件与代码差异，后续的所有版本提交流程与远程推送操作，必须由用户在终端中亲自审查并执行。

4. **Git 操作只读权限白名单**
   - AI 助手仅被允许执行用于排查状态的安全只读类 Git 命令：
     - `git status`（查看当前修改与暂存状态）
     - `git diff`（查看代码修改对比）
     - `git log`（查看历史提交记录）
   - 任何涉及写操作、覆盖、重置、分支切换破坏或提交的 Git 命令（如 `git commit`, `git push`, `git reset`, `git rebase` 等）均在严禁之列。

---

## 🚫 测试文件约束 (No Test Files Rule)

- **绝对禁止新增测试文件**：根据用户明确要求，严禁在工程中创建任何测试脚本、测试用例或测试报告（如 `test_*.js`、`*.test.js`、`TEST_*.md` 等），彻底避免无谓增加 Token 消耗与代码包体积。
- 项目质量验证必须复用现有的工程检验脚本（如 `scripts/verify_js.js`, `scripts/verify_wxml.py`），严禁新建测试文件。
