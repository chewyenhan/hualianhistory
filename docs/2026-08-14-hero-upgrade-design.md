# 双人大决战 · 英雄系统升级设计方案

> 日期：2026-08-14
> 目标文件：`hualianhistory/quiz-battle.html`
> 状态：**✅ 已确认**（决策见 §9；最终 go 后生成素材 + 改代码）

---

## 1. 背景与目标

学生反馈两个问题：
1. **英雄太少**，且**没有女性选择**（参考王者荣耀的英雄池设定）
2. 人物是**像素小人（"沙盒感"）**，希望更逼真

本次升级目标：
- 英雄 **6 → 12**（6 男 6 女），中国神话/历史英雄，带职业定位
- 选角界面 + 战斗内人物都换 **AI 生成动漫立绘**（非像素）
- 加入 **出场动画（AI 视频）** + **出场人声（中文台词）**
- 保持：离线可玩、教室投屏、GitHub Pages 静态部署

---

## 2. 现状梳理（quiz-battle.html）

- `CHARACTERS` 对象（约 L853）定义 6 个英雄：`knight/archer/mage/ninja/viking/samurai`，只有 `name/emoji/colors` 三个字段
- `getCharacterCanvas(key, level)` 用 canvas `fillRect` 画 48×48 像素小人，3 级进化（银→金）
- 选角流程：轮盘抽签 → 选角（像素卡片）→ 战斗
- 战斗用 canvas 动画：弹道/倒地/粒子，`leftCharacter`/`rightCharacter` 状态

---

## 3. 英雄阵容（12 个）

**IP 提醒**：花木兰、李白、项羽等是公有领域的历史/神话人物，名字可用；但**王者荣耀的具体立绘/皮肤设计有版权**，所以立绘必须**原创生成**，只借"人设原型 + 职业定位"，不复制王者荣耀的美术。

| # | 名字 | 性别 | 定位 | 武器 | 出场台词（edge-tts） |
|---|------|------|------|------|----------------------|
| 1 | 项羽 | 男 | 战士/坦克 | 霸王枪 | 力拔山兮气盖世！ |
| 2 | 关羽 | 男 | 战士 | 青龙偃月刀 | 过五关斩六将，义薄云天！ |
| 3 | 李白 | 男 | 刺客 | 青莲剑 | 十步杀一人，千里不留行！ |
| 4 | 后羿 | 男 | 射手 | 落日神弓 | 吾弓所指，日月无光！ |
| 5 | 诸葛亮 | 男 | 法师 | 羽扇 | 羽扇纶巾，谈笑间樯橹灰飞烟灭。 |
| 6 | 钟馗 | 男 | 坦克 | 斩鬼剑 | 钟馗在此，诸邪退散！ |
| 7 | 花木兰 | 女 | 战士 | 长枪 | 谁说女子不如男！ |
| 8 | 穆桂英 | 女 | 战士 | 红缨枪 | 穆桂英挂帅，巾帼不让须眉！ |
| 9 | 貂蝉 | 女 | 刺客 | 团扇 | 闭月羞花，一笑倾城。 |
| 10 | 王昭君 | 女 | 法师 | 琵琶 | 一曲琵琶，落雁之姿。 |
| 11 | 嫦娥 | 女 | 法师 | 月光/玉兔 | 广寒宫里，清辉如雪。 |
| 12 | 女娲 | 女 | 辅助 | 五彩石 | 炼石补天，福泽苍生。 |

**定位分布**：战士×4、法师×3、刺客×2、射手×1、坦克×1、辅助×1（战士略多，因课堂选角倾向武力型，符合预期）。

---

## 4. 技术方案

### 4.1 立绘生成（agnes-ai）

- **方式**：文生图，模型 `agnes-2.5-flash`，经本地代理 `127.0.0.1:15721`，**免费（$0/张）**
- **风格**：统一"**中国风动漫半身立绘**"，暗色神话背景 + 金色描边（呼应游戏暗色军事 + 金点缀主题）
- **每英雄 2 张图**（见下）：
  - **半身立绘**（选角界面 + 出场卡）：512×512 或 768×1024，动漫半身，暗色背景
  - **全身战斗 sprite**（战斗 canvas）：见 §4.5
- **prompt 模板**（统一 + 每英雄差异化特征）：
  ```
  Generate an anime-style half-body character portrait of [人物],
  [武器/服装/特征]. Style: Chinese myth anime illustration,
  dark dramatic background with golden rim light. Composition: centered,
  facing viewer, heroic pose. Color palette: dark navy + gold accent.
  ```

### 4.2 出场动画（agnes-video V2.0）

- **方式**：图生视频（以半身立绘为参考图），模型 `agnes-video-v2.0`
- **API**：`POST https://apihub.agnes-ai.com/v1/videos`（**key 需先验证是否仍有效，见 §7 风险**）
- **每个英雄 1 段 2–3 秒**：立绘轻微动效（镜头推进 / 粒子 / 武器亮相 / 披风飘动）
- **参数**：720p（1280×768）或 480p（832×448），帧率 24–30，`num_frames ≤ 441`
- **输出** MP4，体积目标 **单段 ≤ 1.5MB**

### 4.3 出场人声（edge-tts）

- **方式**：`uvx edge-tts`，**免费**
- **男英雄**：`zh-CN-YunjianNeural`（激情男声）；**女英雄**：`zh-CN-XiaoxiaoNeural`（温暖女声）
- **每英雄 1 句台词**（见 §3 表格），输出 MP3（~30–80KB/句）
- **降级**：音频缺失时回退到浏览器内置 `SpeechSynthesis`（游戏已用此 API）

### 4.4 出场动画播放策略（决策：直接 AI 视频 + CSS 兜底）

- **主路径**：选角后播放 AI 视频（`<video>` 或 canvas 绘制），结束后进入战斗
- **兜底**：视频缺失/加载失败 → CSS 入场动画（立绘淡入放大 + 名字弹出）
- 视频 lazy-load：只在选角确认后加载对应英雄的视频，降低首屏压力

### 4.5 战斗内人物升级（新增需求：canvas 战斗人物也要更新）

战斗里的小人从"像素 fillRect"换成 **AI 全身立绘 sprite**：

- **生成**：每个英雄 1 张**全身动漫立绘**，画在**纯绿幕背景**上（agnes-ai 文生图，`Generate a full-body anime character of [人物] standing on a solid green background, full figure from head to toe, no cropping`）
- **抠图**：build 阶段用一个一次性脚本做 **chroma-key 去绿幕** → 输出透明背景 PNG（脚本只在生成时本地跑，不提交、不含 key）
- **尺寸**：全身 sprite 建议 512×768 或 512×1024，站立朝前
- **战斗动画改造**（保留现有弹道/粒子/背景系统，只换人物绘制）：
  - 站立：`drawImage` 全身 sprite（~150–200px 高）
  - 攻击：前冲（translate x）+ 现有弹道
  - 倒地：旋转 90° + 下坠（沿用现有 `FALL` 逻辑，改 drawImage 的 transform）
  - 受击：短暂抖动/白闪
  - 升级（3 级）：sprite 外围加**银→金光环/粒子**（替换原像素"银/金装甲"）
- **替换范围**：`getCharacterCanvas()` 及所有 `drawImage(sprite.canvas, ...)` 调用点 → `getBattleSprite()`（加载 PNG 的 `HTMLImageElement` + 缓存）
- **降级**：PNG 未加载完成 → 先用原像素小人占位，加载后无缝替换

---

## 5. 代码改动点（quiz-battle.html）

1. **数据层**：`CHARACTERS` → 新 `HEROES` 对象，字段扩展：
   ```js
   const HEROES = {
     xiangyu: { name:'项羽', gender:'male', role:'战士', emoji:'🔱',
                colors:['#4a5568','#2d3748','#ffd700'],
                portrait:'assets/heroes/xiangyu.png',      // 半身立绘（选角/出场）
                battleSprite:'assets/heroes/xiangyu-battle.png', // 全身透明 sprite（战斗）
                introVideo:'assets/heroes/xiangyu-intro.mp4',
                introVoice:'assets/heroes/xiangyu-voice.mp3',
                introLine:'力拔山兮气盖世！' },
     // ... 共 12 个
   }
   ```
2. **选角 UI**：像素 emoji 卡片 → **立绘网格**（3×4），每格 = 半身立绘 + 名字 + 定位标签 + 性别角标
3. **出场阶段（新增）**：选角后插入 `intro` 状态 → 播放 AI 视频（+ 语音 + 名字弹出）→ 点"开始战斗"进入战斗；视频缺失回退 CSS 过渡
4. **战斗内**：`getCharacterCanvas()` 像素小人 → `getBattleSprite()` 全身透明立绘 + canvas transform 对打动画（前冲/倒地/受击/升级光环），**保留弹道/粒子/背景系统**；顶部头像用半身立绘缩略图
5. **音效**：新增 `Audio` 对象播放出场语音（浏览器 autoplay 需用户交互，选角点击天然满足）
6. **降级**：所有新资产 `onerror` 回退到现有像素风 + emoji 卡片

---

## 6. 资产清单（每英雄 4 文件）

```
hualianhistory/assets/heroes/
├── xiangyu.png          # 半身立绘（选角/出场）
├── xiangyu-battle.png   # 全身透明 sprite（战斗，绿幕抠图后）
├── xiangyu-intro.mp4    # 出场动画视频
├── xiangyu-voice.mp3    # 出场台词语音
├── ...（12 个英雄 × 4 = 48 个文件）
```
体积预估：立绘 12×~250KB ≈ 3MB，战斗 sprite 12×~150KB ≈ 2MB，视频 12×~1.5MB ≈ 18MB，语音 12×~60KB ≈ 1MB，**总计约 20–25MB**（用户已确认可接受）。

---

## 7. 成本与风险

### 成本
| 项 | 工具 | 费用 |
|----|------|------|
| 24 立绘/sprite | agnes-ai | $0（免费） |
| 12 语音 | edge-tts | $0（免费） |
| 12 出场视频 | agnes-video V2.0 | **待验证**（2026-08-08 测试时未记录价格） |

### 风险
1. **⚠️ agnes-video 能力漂移**：磁盘 `agnes-video/SKILL.md` 现在是「视频理解」版，视频生成 API（`apihub.agnes-ai.com/v1/videos` + key）是 5 天前记忆里的记录，**实施前必须先打一个测试请求验证**是否仍可用、是否计费。
2. **⚠️ API key 泄露**：视频生成 key 只能用于**生成阶段（本地跑）**，**绝不能写进 quiz-battle.html 或提交到公开仓库**（GitHub Pages 是公开的）。生成的 png/mp4/mp3 是纯静态文件，安全。
3. **抠图质量**：绿幕 chroma-key 可能有边缘残绿，需在 build 脚本里加"去绿边 + 羽化"；个别效果不佳的英雄手动补一次图生图。
4. **体积/加载**：25MB 资产首次加载慢，战斗 sprite 和视频 lazy-load（选角确认后才加载）。
5. **浏览器 autoplay**：语音/视频需用户交互触发，选角点击已满足；投屏场景需测试。
6. **版权**：原创立绘，不复制王者荣耀具体美术设计。

---

## 8. 实施步骤（确认后执行）

1. **验证 agnes-video V2.0**：发一个测试图生视频请求，确认可用 + 价格（**阻塞项，先做**）
2. 生成 12 张半身立绘（agnes-ai）
3. 生成 12 张全身绿幕 sprite（agnes-ai）→ chroma-key 抠图成透明 PNG
4. 生成 12 句台词 MP3（edge-tts）
5. 生成 12 段出场视频（agnes-video）
6. 改造 quiz-battle.html：`HEROES` 数据 + 选角立绘网格 + 出场视频/语音 + 战斗 sprite
7. 本地测试 → 部署 hualianhistory

---

## 9. 已确认决策（2026-08-14）

- [x] **阵容**：12 人都可以（项羽/关羽/李白/后羿/诸葛亮/钟馗 + 花木兰/穆桂英/貂蝉/王昭君/嫦娥/女娲）
- [x] **立绘风格**：动漫风格，半身（选角用）；战斗用全身 sprite
- [x] **动画策略**：直接上 AI 视频出场（Phase 2），CSS 过渡作兜底
- [x] **体积**：接受 ~20–25MB
- [x] **战斗人物**：canvas 战斗里的小人一并换成 AI 全身立绘
