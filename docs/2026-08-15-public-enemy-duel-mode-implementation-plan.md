# 双人决战 · 天下公敌 + 移除强制休息 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把组别对决的「天下公敌」平衡机制移植到双人决战模式，同时彻底移除双人决战的「5连胜强制休息」。

**Architecture:** 在 `resolveRound` 中把天下公敌的触发/讨伐逻辑从组别块抽出为**模式感知**逻辑（`group` 维持原奖励；`solo` 改为讨伐者 +2 + 全体其他存活学生各 +1）。新增双人报名函数复用现有 `#public-enemy-signup-panel`（新增学生按钮容器 + 动态奖励文案）。`proceedAfterRound` 双人分支在天下公敌生效时跳转报名面板；`startBattle` 重置状态。删除强制休息块并清理 `resting` 死代码。

**Tech Stack:** 单文件 vanilla JS HTML（`quiz-battle.html`），Tailwind CDN，Canvas。无测试框架 —— 用 Chrome DevTools MCP + 页面内函数调用验证。

**设计依据:** `hualianhistory/docs/2026-08-15-public-enemy-duel-mode-design.md`（已提交 d4631c6）

## Global Constraints

- 组别模式现有天下公敌逻辑**保持不动**（奖励/文案/流程完全一致，只做结构抽出）。
- 双人模式讨伐奖励 = 讨伐者 `wins += 2`，且**除讨伐者外**的全体其他存活学生各 `wins += 1`（讨伐者不叠加；王者已淘汰自然不含）。讨伐者那轮共 +4（1正常胜 +1 King Slayer +2 天下公敌）。
- 触发阈值：连胜 **≥5**（沿用组别模式与旧强制休息的阈值）。
- 不添加第二层保险机制（王者登基 / 连续未推翻强制退位）——用户以后再加。
- 双人模式从此**无硬性连胜上限**（用户明确选择，用于先实测）。
- 只修改 `hualianhistory/quiz-battle.html`；设计文档已提交；实施后推送到 `chewyenhan/hualianhistory`（git submodule，非根仓库）。
- 编辑一律用内容匹配（Edit 工具），不依赖行号。

---

### Task 1: resolveRound 改造 — 移除强制休息块 + 天下公敌模式感知触发/讨伐

**Files:**
- Modify: `hualianhistory/quiz-battle.html`（`resolveRound`，原 3547-3663 行区域）

**Interfaces:**
- Consumes: `students[winnerName].streak`（移除强制休息后不再在 5 连胜清零）、`students[loserName]`、`winningSide`/`loserSide`、`publicEnemyState`（全局，已在 806 行声明）。
- Produces: `publicEnemyState.active/kingPlayer/kingStreak/kingGroupIdx`（solo 时 `kingGroupIdx` 为 `null`）；双人讨伐发奖逻辑。

- [ ] **Step 1: 删除强制休息块**

删除 `resolveRound` 中「王者超载」整段。**起点标记**：`// 连胜≥5 强制休息（仅双人决战模式）：王者让位下台，名字保留在轮盘待再抽。` 注释；**终点标记**：紧接着其后的 `// Always update loser stats (MUST run before skill wheel check)` 注释。从起点注释到终点注释之间的全部内容（含 `var restedName = null;`、`if (gameMode !== 'group' && students[winnerName].streak >= 5) {` 整个块及其内部 `setTimeout(...)`，以及它们之前的空行）整体删除，保留终点注释行及其后续 loser 统计逻辑不变。

删除后，连胜在 5、6、7… 持续累积，不再清零。

- [ ] **Step 2: 重构天下公敌为模式感知**

把现有组别块（`if (gameMode === 'group' && groups.length > 0) { ... }`）内的**天下公敌 ①② 两段**抽出到组别块之后，改为对两种模式生效：

组别块保留的部分（只保留加分 + 淘汰标记）：
```js
        // Update group stats (group mode)
        if (gameMode === 'group' && groups.length > 0) {
            var wGid = winningSide === 'left' ? groupWheelState.leftGroupIdx : groupWheelState.rightGroupIdx;
            var lGid = winningSide === 'left' ? groupWheelState.rightGroupIdx : groupWheelState.leftGroupIdx;
            if (wGid !== null && wGid !== undefined && groups[wGid]) groups[wGid].totalWins += (students[winnerName].wins - winsBefore);
            // Mark loser player as eliminated in group
            if (lGid !== null && lGid !== undefined && groups[lGid]) {
                groups[lGid].players.forEach(function(p) {
                    if (p.name === loserName) p.eliminated = true;
                });
            }
        }

        // ===== 天下公敌（两种模式共用）=====
        // ① 王者晋升：守擂玩家连胜≥5 且当前不在天下公敌状态 → 触发
        if (!publicEnemyState.active && students[winnerName].streak >= 5) {
            publicEnemyState.active = true;
            publicEnemyState.kingGroupIdx = (gameMode === 'group') ? wGid : null;
            publicEnemyState.kingPlayer = winnerName;
            publicEnemyState.kingStreak = students[winnerName].streak;
            if (gameMode === 'group') {
                showBigPopup('👑', '天下公敌！',
                    [winnerName + ' 连胜' + students[winnerName].streak + '场，晋升王者！', '打败王者，全体剩余组别各 +2 分！'],
                    winnerName + '连胜' + students[winnerName].streak + '场，晋升王者！天下公敌启动！打败王者，全体剩余组别各加2分！');
            } else {
                showBigPopup('👑', '天下公敌！',
                    [winnerName + ' 连胜' + students[winnerName].streak + '场，晋升王者！', '打败王者，讨伐者 +2 分，全体存活各 +1 分！'],
                    winnerName + '连胜' + students[winnerName].streak + '场，晋升王者！天下公敌启动！打败王者，讨伐者加2分，全体存活各加1分！');
            }
        }
        // ② 讨伐成功：王者本人被击败 → 按模式发奖，天下公敌解除
        if (publicEnemyState.active && loserName === publicEnemyState.kingPlayer) {
            var slayedKing = publicEnemyState.kingPlayer;
            if (gameMode === 'group') {
                groups.forEach(function(g, gid) {
                    if (gid === publicEnemyState.kingGroupIdx) return;
                    if (g.aliveCount > 0) g.totalWins += 2;
                });
                showBigPopup('⚔️', '讨伐成功！',
                    [winnerName + ' 击败了王者 ' + slayedKing + '！', '全体剩余组别各 +2 分！'],
                    winnerName + '击败了天下公敌！全体剩余组别各加2分！');
            } else {
                // 双人决战：讨伐者 +2，全体其他存活学生各 +1（讨伐者不叠加；王者已淘汰）
                students[winnerName].wins += 2;
                Object.keys(students).forEach(function(n) {
                    if (n === winnerName) return;
                    if (n === publicEnemyState.kingPlayer) return;
                    if (students[n] && !students[n].eliminated) students[n].wins += 1;
                });
                showBigPopup('⚔️', '讨伐成功！',
                    [winnerName + ' 击败了王者 ' + slayedKing + '！', '讨伐者 +2 分，全体存活各 +1 分！'],
                    winnerName + '击败了天下公敌！讨伐者加2分，全体存活各加1分！');
            }
            publicEnemyState.active = false;
            publicEnemyState.kingGroupIdx = null;
            publicEnemyState.kingPlayer = null;
            publicEnemyState.kingStreak = 0;
        }
```

注意：`wGid`/`lGid` 用 `var` 声明（函数作用域提升），solo 时 `wGid` 为 `undefined`，由 `(gameMode === 'group') ? wGid : null` 兜底为 `null`。

- [ ] **Step 3: 语法检查**

用 Node 做语法校验（纯 JS 部分——文件是 HTML，先用 `node --check` 不行就手动查括号配对，或临时抽 JS）。最可靠：浏览器加载，控制台无报错（见 Task 5 前先做快速加载检查）。

Run: 在浏览器打开 `file:///d:/AIgames/hualianhistory/quiz-battle.html`
Expected: 控制台无 JS 语法/运行时错误（允许预存的 file:// CORS 警告）。

- [ ] **Step 4: 组别模式回归抽查**

Run: 临时 `grep` 天下公敌触发/讨伐段确认逻辑仍在且文案未变：
```
grep -n "全体剩余组别各" hualianhistory/quiz-battle.html
```
Expected: 出现 2 处（①弹窗 + ②弹窗），文案与改前一致。

- [ ] **Step 5: Commit**

```bash
git add quiz-battle.html
git commit -m "feat: 双人决战天下公敌模式感知触发/讨伐，移除强制休息块"
```

---

### Task 2: 清理 resting 死代码

**Files:**
- Modify: `hualianhistory/quiz-battle.html`（7 处 `resting` 引用）

**Interfaces:**
- 无新接口。删除后 `resting` 字段不再被任何逻辑读取（students 对象中的 `resting` 字段可保留，无副作用）。

- [ ] **Step 1: 逐个删除 resting 引用**

| 位置 | 原文（匹配片段） | 改为 |
|------|-----------------|------|
| `getWheelCandidateNames`（原2220） | `filter(function(n) { return !students[n].eliminated && !students[n].resting; })` | `filter(function(n) { return !students[n].eliminated; })` |
| `getAvailableStudents`（原2306） | `filter(n => !students[n].eliminated && !students[n].resting)` | `filter(n => !students[n].eliminated)` |
| `getUneliminatedStudents`（原2310） | `filter(n => !students[n].eliminated && !students[n].resting)` | `filter(n => !students[n].eliminated)` |
| `startBattleRound` 重置（原3211-3212） | `// 强制休息结束：让位者重新进入轮盘候选\n    Object.keys(students).forEach(function(n) { if (students[n].resting) students[n].resting = false; });` | 删除整两行 |
| `proceedAfterRound` onStage（原3754-3755） | `var leftOnStage = leftAlive && !(students[leftName] && students[leftName].resting);\n    var rightOnStage = rightAlive && !(students[rightName] && students[rightName].resting);` | `var leftOnStage = leftAlive;\n    var rightOnStage = rightAlive;` |
| `spinForSlot`（原3788） | `filter(function(n) { return !students[n].eliminated && !students[n].resting; })` | `filter(function(n) { return !students[n].eliminated; })` |
| `spinForBoth`（原3860） | `filter(function(n) { return !students[n].eliminated && !students[n].resting; })` | `filter(function(n) { return !students[n].eliminated; })` |

- [ ] **Step 2: 验证无残留**

Run:
```
grep -rn "resting" hualianhistory/quiz-battle.html
```
Expected: 0 条匹配（`students` 初始化对象里的字段名若有 `resting: 0` 则一并删除，保持一致）。

- [ ] **Step 3: 快速加载检查**

Run: 浏览器打开页面，控制台无报错。

- [ ] **Step 4: Commit**

```bash
git add quiz-battle.html
git commit -m "refactor: 移除强制休息后清理 resting 死代码"
```

---

### Task 3: 双人报名面板 UI + 新增函数

**Files:**
- Modify: `hualianhistory/quiz-battle.html`
  - HTML：`#public-enemy-signup-panel`（原 623-628 行）
  - `showPublicEnemySignup`（原 2757-2786）：加奖励行动态文案 + 容器显隐
  - 在 `choosePublicEnemyChallengerGroup`（原 2789-2801）之后新增两个函数

**Interfaces:**
- Consumes: `#public-enemy-signup-panel`、`#public-enemy-king-line`、`publicEnemyState`、`battleState.leftStudent/rightStudent`、`students`。
- Produces: `showPublicEnemyDuelSignup()`、`choosePublicEnemyDuelChallenger(name)`，被 Task 4 的 `proceedAfterRound` 调用。

- [ ] **Step 1: HTML — 奖励行加 id + 新增学生按钮容器**

`#public-enemy-signup-panel` 内，给奖励文案 `<p>` 加 `id="public-enemy-reward-line"`，并在 `#public-enemy-group-buttons` 之后新增：

```html
    <div id="public-enemy-student-buttons" class="flex flex-wrap gap-4 justify-center">
        <!-- JS dynamic -->
    </div>
```

（奖励行原内容 `⚔️ 打败王者，全体剩余组别各 <span class="text-4xl">+2</span> 分！` 保留为组别默认文案，作为新 id 的初始 innerText。）

- [ ] **Step 2: `showPublicEnemySignup`（组别）加动态文案 + 容器显隐**

在函数开头（隐藏各 view 之后、`panel.classList.remove('hidden')` 之前）插入：

```js
    document.getElementById('public-enemy-reward-line').innerText = '⚔️ 打败王者，全体剩余组别各 +2 分！';
    document.getElementById('public-enemy-group-buttons').classList.remove('hidden');
    document.getElementById('public-enemy-student-buttons').classList.add('hidden');
```

- [ ] **Step 3: 新增 `showPublicEnemyDuelSignup()`**

在 `choosePublicEnemyChallengerGroup` 之后追加：

```js
// 天下公敌生效 → 双人决战报名制：列出所有存活且非王者学生，老师点选谁来挑战
function showPublicEnemyDuelSignup() {
    document.getElementById('setup-view').classList.add('hidden');
    document.getElementById('battle-view').classList.add('hidden');
    document.getElementById('wheel-view').classList.add('hidden');
    document.getElementById('group-player-pick-panel').classList.add('hidden');
    document.getElementById('spin-btn').classList.add('hidden');

    var panel = document.getElementById('public-enemy-signup-panel');
    panel.classList.remove('hidden');
    document.getElementById('public-enemy-reward-line').innerText = '⚔️ 打败王者，讨伐者 +2 分，全体存活各 +1 分！';
    document.getElementById('public-enemy-group-buttons').classList.add('hidden');
    document.getElementById('public-enemy-student-buttons').classList.remove('hidden');

    var kingName = publicEnemyState.kingPlayer || '';
    document.getElementById('public-enemy-king-line').innerText = '👑 王者：' + kingName + ' 连胜' + publicEnemyState.kingStreak + '场守擂中';

    var buttonsDiv = document.getElementById('public-enemy-student-buttons');
    buttonsDiv.innerHTML = '';
    Object.keys(students).forEach(function(n) {
        if (n === kingName) return;
        if (students[n].eliminated) return;
        var btn = document.createElement('button');
        btn.className = 'group-player-btn';
        btn.style.border = '2px solid #f87171';
        btn.innerText = '🔥 ' + n + ' 报名挑战';
        btn.onclick = function() { choosePublicEnemyDuelChallenger(n); };
        buttonsDiv.appendChild(btn);
    });
    if (buttonsDiv.children.length === 0) {
        buttonsDiv.innerHTML = '<p class="text-2xl font-black text-white">没有可挑战的对手了 → 王者夺冠！</p>';
        setTimeout(showLeaderboard, 1200);
    }
}
```

- [ ] **Step 4: 新增 `choosePublicEnemyDuelChallenger(name)`**

```js
// 报名选挑战者 → 王者保留角色，挑战者进单侧选角（复用 startSingleCharSelect）
function choosePublicEnemyDuelChallenger(name) {
    document.getElementById('public-enemy-signup-panel').classList.add('hidden');
    var kingSide = (publicEnemyState.kingPlayer === battleState.leftStudent) ? 'left' : 'right';
    var challengerSide = kingSide === 'left' ? 'right' : 'left';

    if (!students[name]) {
        students[name] = { name: name, wins: 0, losses: 0, streak: 0, bestStreak: 0, character: null, level: 1, eliminated: false, usedCount: 1, totalQuestions: 0, correctAnswers: 0 };
    } else {
        students[name].usedCount = (students[name].usedCount || 0) + 1;
    }
    markStudentPicked(name);
    students[name].eliminated = false;

    if (challengerSide === 'left') {
        battleState.leftStudent = name;
        if (students[name].character) {
            battleState.leftCharacter = students[name].character;
            battleState.leftLevel = students[name].level || 1;
        }
        skillState.leftSkill = null; skillState.leftSkillConsumed = false; skillState.leftDoubleScore = false;
        skillState.leftLastSkillStreak = 0;
    } else {
        battleState.rightStudent = name;
        if (students[name].character) {
            battleState.rightCharacter = students[name].character;
            battleState.rightLevel = students[name].level || 1;
        }
        skillState.rightSkill = null; skillState.rightSkillConsumed = false; skillState.rightDoubleScore = false;
        skillState.rightLastSkillStreak = 0;
    }
    startSingleCharSelect(challengerSide);
}
```

- [ ] **Step 5: 浏览器加载检查**

Run: 打开页面，控制台无报错；手动进入组别模式抽到天下公敌，确认报名面板仍正常显示组别按钮（回归）。

- [ ] **Step 6: Commit**

```bash
git add quiz-battle.html
git commit -m "feat: 双人决战天下公敌报名面板（学生按钮+动态奖励文案）"
```

---

### Task 4: proceedAfterRound 双人接线 + startBattle 重置

**Files:**
- Modify: `hualianhistory/quiz-battle.html`
  - `proceedAfterRound`（原 3738 起，双人分支）
  - `startBattle`（原 2035 起）

**Interfaces:**
- Consumes: `showPublicEnemyDuelSignup()`（Task 3）、`publicEnemyState`、`students[n].eliminated`。
- Produces: 天下公敌生效时双人模式每轮结束进入报名面板；开局重置状态。

- [ ] **Step 1: `proceedAfterRound` 双人分支插入天下公敌接线**

在 `proceedAfterRound` 中 `battleState.questionIndex++;` 之后、`if (battleState.questionIndex >= scenes.length) {...}` 结束判断的 `}` **之后**（即进入 `var leftName = ...` 之前），插入：

```js
    // 天下公敌（双人决战）：王者已被淘汰（如双方超时都算输）→ 解除
    if (publicEnemyState.active && students[publicEnemyState.kingPlayer] && students[publicEnemyState.kingPlayer].eliminated) {
        publicEnemyState.active = false;
        publicEnemyState.kingGroupIdx = null;
        publicEnemyState.kingPlayer = null;
        publicEnemyState.kingStreak = 0;
    }
    // 天下公敌生效中：跳过轮盘，进入「谁愿挑战王者？」报名制
    if (publicEnemyState.active) {
        showPublicEnemyDuelSignup();
        return;
    }
```

（注意：本函数开头已 `if (gameMode === 'group') { groupProceedAfterRound(); return; }`，故此处只走双人分支，无需再判 gameMode。）

- [ ] **Step 2: `startBattle` 重置 publicEnemyState**

在 `startBattle` 的 `pickedStudentSet = {};`（原 2058 行）之后、`startWheelPhase();` 之前，插入：

```js
    publicEnemyState = { active: false, kingGroupIdx: null, kingPlayer: null, kingStreak: 0 };
    document.getElementById('public-enemy-signup-panel').classList.add('hidden');
```

- [ ] **Step 3: 浏览器加载检查**

Run: 打开页面，控制台无报错。

- [ ] **Step 4: Commit**

```bash
git add quiz-battle.html
git commit -m "feat: 双人决战天下公敌轮转接线 + 开局状态重置"
```

---

### Task 5: 浏览器全流程验证（Chrome DevTools MCP）

**Files:** 无改动 —— 纯验证。

- [ ] **Step 1: 加载页面，确认无 JS 错误**

用 `list_console_messages` 确认只有预存的 file:// CORS / Tailwind 警告，无新增语法/引用错误。

- [ ] **Step 2: solo 触发验证**

通过 `evaluate_script` 构造双人模式状态：`gameMode='solo'`、`battleState.leftStudent='甲'`、`students['甲']` 连胜 streak=5，手动调用 `resolveRound` 的胜利分支（或直接调用王者晋升判定逻辑），断言：
- `publicEnemyState.active === true`
- `publicEnemyState.kingPlayer === '甲'`
- `publicEnemyState.kingGroupIdx === null`
- 弹窗文案含「讨伐者 +2 分，全体存活各 +1 分」

- [ ] **Step 3: solo 报名面板验证**

设 `publicEnemyState.active=true, kingPlayer='甲'`，调用 `showPublicEnemyDuelSignup()`，断言：
- 面板显示
- 按钮列表排除「甲」，包含所有存活非淘汰学生
- 奖励行文案 =「讨伐者 +2 分，全体存活各 +1 分」

- [ ] **Step 4: solo 讨伐奖励验证**

设 `甲` 连胜5 晋升王者、`乙` 为挑战者。让 `乙` 胜 `甲`（King Slayer 路径），断言：
- `students['乙'].wins` 增量 = +4（1正常 +1 Slayer +2 天下公敌）
- 所有其他存活学生 `wins` 各 +1
- `publicEnemyState.active === false`
- 弹窗文案含「讨伐者 +2 分，全体存活各 +1 分」

- [ ] **Step 5: 无挑战者边界**

设只有王者存活，调用 `showPublicEnemyDuelSignup()`，断言显示「没有可挑战的对手了 → 王者夺冠！」且 1200ms 后进 `showLeaderboard`。

- [ ] **Step 6: 王者双输被淘汰**

设 `publicEnemyState.active=true`，将王者 `eliminated=true`，调用 `proceedAfterRound`，断言 `publicEnemyState.active === false` 且流程未进入报名面板（恢复正常轮盘）。

- [ ] **Step 7: 组别模式回归**

构造组别模式 5 连胜王者 + 讨伐，断言组别奖励与文案与改前一致（全体剩余组各 +2；讨伐组共 +4）。

- [ ] **Step 8: 截图留档**

`take_screenshot` 报名面板界面，供用户目视确认。

---

### Task 6: 提交 + 推送

**Files:** 无代码改动。

- [ ] **Step 1: 确认改动文件清单**

Run: `git status --short`
Expected: 仅 `quiz-battle.html`（+ 已提交的 docs 设计文档应已包含在本任务前的某个 commit）。

- [ ] **Step 2: 汇总提交（如 Task 1-4 已逐任务提交，则跳过）**

```bash
git log --oneline -6
```

- [ ] **Step 3: 推送**

```bash
git push origin main
```
Expected: `main` → `chewyenhan/hualianhistory`，GitHub Pages 自动重建。

- [ ] **Step 4: 汇报**

输出：功能摘要、验证结果、访问地址 `chewyenhan.github.io/hualianhistory/`。
