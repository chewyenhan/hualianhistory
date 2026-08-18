# 英雄大招视频 · 生视频分镜与提示词（12 英雄版）

> 日期：2026-08-19
> 目标：为 quiz-battle.html 的 12 位英雄各生成一段 4~5s 大招视频（`*-ultimate.mp4`），
> 在「双倍得分」大招命中时全屏播放。
> 铁律：**镜头只聚焦英雄本身，绝不拍敌人**——对敌每场不同，为敌人做视频是无底洞。
>
> **⚠️ 外观依据**：本文件全部武器/服装/特征描述**均已用 Gemini 视觉逐张核对其实立绘**
> （`assets/heroes/*-battle.png`），不是凭常识猜测。参考图=对应 battle sprite，
> prompt 描述与照片完全一致，避免生成出"换了武器"的英雄。

## 一、生成策略

| 项目 | 选择 | 理由 |
|------|------|------|
| 模式 | **图生视频**（image-to-video） | 参考图=模型照片，人物形象 100% 一致 |
| 参考图 | `assets/heroes/{hero}-battle.png` | 全身立绘，prompt 指定水墨战场背景 |
| 时长 | 4.6s（30fps × 137帧，137=8×17+1 合法） | 贴合 4~5s 目标 |
| 分辨率 | 720p（1280×768） | 教室投屏清晰度 |
| 风格 | 统一「中国水墨 × 金紫光效」2D 游戏插画风 | 与现有立绘风格一致 |
| 流程 | **先做 1 个（关羽）试点 → 确认 → 批量 12 个** | 避免批量后风格跑偏 |

**Agnes API**（`agnes-video-skill`，key 已备）：
```
POST https://apihub.agnes-ai.com/v1/videos
model: agnes-video-v2.0
prompt: <英文提示词>
image: <battle-sprite 的 URL>   # 图生视频必填
num_frames: 137                 # ≤441，需符合 8n+1
frame_rate: 30                  # 1–60
width: 1280, height: 768        # 720p
```

> 参考图 URL：素材已入 `hualianhistory` 仓库，push 后可用
> `https://raw.githubusercontent.com/chewyenhan/hualianhistory/main/assets/heroes/{hero}-battle.png`
> 透明 PNG 生视频时背景可能被填黑，故 prompt 统一要求「暗色水墨战场」，正合主题。

## 二、通用分镜结构（英雄本位 · 无敌人版）

| 时间 | 镜头 | 内容（只拍英雄） | 剪辑/运镜 |
|------|------|------------------|-----------|
| 0.0–0.5s | ① 特写蓄力 | 英雄面部/武器特写，能量聚集 | 快切、呼吸感 |
| 0.5–1.2s | ② 中景蓄能 | 英雄全身，气场扩散、能量环绕 | 粒子环绕、衣衫飘动 |
| 1.2–2.5s | ③ 释放大招 | 招牌攻击动作，大招特效打向前方 | 慢动作 + 冲击波 |
| 2.5–3.5s | ④ 特效爆发 | 英雄保持威势，特效全开、镜头微震 | 光爆、拉远 |
| 3.5–4.5s | ⑤ 收招定格 | 收招回立、气势收束 | 定格 + 余韵粒子 |
| 4.5–4.6s | 收尾 | 黑屏淡出 | 平滑过渡 |

## 三、提示词统一模板

```text
2D ink-wash painting style game hero ultimate skill animation.
<英雄外观：武器+服装+特征，逐条与立绘一致> centered,
<招式动作分镜>. <大招特效>. <专属氛围>.
Epic golden-violet energy effects, dramatic rim lighting, particles,
dark misty battlefield background, cinematic camera work.
No enemies, no other characters, hero only. 4.6 seconds.
```

## 四、12 英雄完整分镜 + 英文提示词（外观已核对立绘）

### 1. 项羽「力拔山兮」· 战士 · 双头枪
> 外观：金黄色鳞甲、绿披风红边、高马尾金冠缀红宝石、短须；手持**双头枪**（两端皆有枪尖）
```
2D ink-wash painting style game hero ultimate skill animation.
Xiang Yu the warrior god, golden scale armor with a green cape trimmed in
red, high ponytail held by a golden crown with a ruby, short beard, holding
a twin-headed spear with sharp points at both ends, centered. He spins the
twin-headed spear overhead gathering golden energy, then slams it down —
a colossal golden shockwave erupts from the spearheads, the ground cracks
with golden light, his cape and ponytail whipping in the blast. He plants
the spear and stands firm, cracking ground glowing behind him.
Epic golden-violet energy effects, dramatic rim lighting, particles,
dark misty battlefield background, cinematic camera work.
No enemies, no other characters, hero only. 4.6 seconds.
```

### 2. 关羽「武圣临尘」· 战士 · 青龙偃月刀
> 外观：白色长袍绿边、棕褐腰带金狮扣、金色龙纹肩甲、红褐美髯、武冠
```
2D ink-wash painting style game hero ultimate skill animation.
Guan Yu the god of war, white robe trimmed in green with golden dragon
shoulder armor, long russet-red beard, solemn face, wielding a huge
green dragon crescent glaive, centered. An azure dragon spirit coils
around the blade as he sweeps the glaive in a wide arc — a giant cyan
crescent energy blade slashes across the screen with a dragon roar,
mist swirling. He regrips the glaive and stands proud, dragon spirit
circling above him.
Epic golden-violet energy effects, dramatic rim lighting, particles,
dark misty battlefield background, cinematic camera work.
No enemies, no other characters, hero only. 4.6 seconds.
```

### 3. 李白「青莲剑气」· 刺客 · 剑
> 外观：白色水墨长袍、长发束髻、手持银剑+黑剑鞘
```
2D ink-wash painting style game hero ultimate skill animation.
Li Bai the sword poet, white ink-wash robe, long hair in a topknot,
drawing a silver sword from its black scabbard, centered. Sword energy
blossoms like a lotus — countless ethereal sword projections spiral
outward from him in cyan-white aura, petals swirling, his robes and hair
blowing in the sword wind. He flicks the blade clean and sheathes it,
lotus petals settling around him.
Epic golden-violet energy effects, dramatic rim lighting, particles,
dark misty battlefield background, cinematic camera work.
No enemies, no other characters, hero only. 4.6 seconds.
```

### 4. 后羿「落日九箭」· 射手 · 神弓
> 外观：白蓝青绿交领长袍、金臂绿弦复合弓、束发蓝宝石发冠
```
2D ink-wash painting style game hero ultimate skill animation.
Hou Yi the divine archer, white-and-cyan robe, drawing a composite bow
with golden arms and a glowing green string, hair tied in a crown set
with a sapphire, centered. Nine blazing solar arrows ignite on the
bowstring one by one, then all nine fire skyward and descend as golden
meteors, solar-bright light bursting behind him, heat shimmer in the air.
He lowers the bow and gazes up, sunburst glow fading around him.
Epic golden-violet energy effects, dramatic rim lighting, particles,
dark misty battlefield background, cinematic camera work.
No enemies, no other characters, hero only. 4.6 seconds.
```

### 5. 诸葛亮「卧龙吟」· 法师 · 羽扇
> 外观：浅绿/青绿长袍、高冠、山羊胡、手持白羽扇（扇柄垂蓝珠）
```
2D ink-wash painting style game hero ultimate skill animation.
Zhuge Liang the strategist-mage, pale-green robe, tall scholar crown,
goatee beard, holding a white feather fan with a blue bead pendant,
calm expression, centered. He sweeps the feather fan and summons a
roaring inferno vortex — a blue-gold flame dragon spirals up around him,
thunderclouds roll, his robe and beard blow in the wind while he stays
composed. He closes the fan, the vortex collapses into embers falling
around him.
Epic golden-violet energy effects, dramatic rim lighting, particles,
dark misty battlefield background, cinematic camera work.
No enemies, no other characters, hero only. 4.6 seconds.
```

### 6. 钟馗「鬼门关」· 坦克 · 斩妖剑
> 外观：深灰/黑宽袖长袍、浓密黑长须+八字胡、发髻横簪、手持金饰单手剑
```
2D ink-wash painting style game hero ultimate skill animation.
Zhong Kui the demon-hunter, dark grey-black robe, dense black beard and
moustache, hair in a topknot with a hairpin, wielding a one-handed sword
with golden ornaments, fierce eyes, centered. He plants the sword and a
ghost-gate opens behind him — writhing spectral souls swirl out as
ghost-fire chains, purple-green spectral light bathes him, he roars with
a commanding stance. He raises the sword, the ghost-gate seals shut,
spirits fading to wisps.
Dark ominous aura, dramatic rim lighting, particles, dark misty battlefield
background, cinematic camera work. No enemies, no other characters, hero only. 4.6 seconds.
```

### 7. 花木兰「木兰辞」· 战士 · 红缨长枪
> 外观：黑灰重铠+红边金饰、高马尾红发绳、手持长枪（银头金雕红宝石）
```
2D ink-wash painting style game hero ultimate skill animation.
Hua Mulan, female warrior in dark heavy armor trimmed with red and gold,
hair in a high ponytail bound with red ribbons, wielding a long spear
with a silver gold-carved head, graceful yet fierce, centered. She spins
the spear in a blazing dance — crimson energy blossoms like flower petals
around the blade, a storm of red petals and golden sparks spirals as she
thrusts and whirls. She stops mid-dance and plants the spear, petals
settling around her feet.
Epic golden-violet energy effects, dramatic rim lighting, particles,
dark misty battlefield background, cinematic camera work.
No enemies, no other characters, hero only. 4.6 seconds.
```

### 8. 穆桂英「挂帅令」· 战士 · 红缨长枪
> 外观：铁灰铠甲+暗红边缘、发冠红羽红宝石、手持红缨长枪
```
2D ink-wash painting style game hero ultimate skill animation.
Mu Guiying, female general in iron-grey armor trimmed with dark red,
crown with red feathers and a ruby, heroic and graceful, wielding a long
spear with a red tassel at the head, centered. She thrusts the spear and
a golden war-gate banner unfurls behind her, phantom warriors of her army
charging out as golden energy waves, war drums rumbling, she raises the
spear commanding the charge. She lowers the spear, phantom army dissolving
into golden dust.
Epic golden-violet energy effects, dramatic rim lighting, particles,
dark misty battlefield background, cinematic camera work.
No enemies, no other characters, hero only. 4.6 seconds.
```

### 9. 貂蝉「闭月舞」· 刺客 · 团扇
> 外观：浅绿汉服+花鸟刺绣、花钿、金发簪、手持**圆形宫扇**（团扇，柄坠流苏）
```
2D ink-wash painting style game hero ultimate skill animation.
Diaochan, female assassin in pale-green hanfu embroidered with flowers,
red forehead mark (huadian), golden hairpins, holding a round silk fan
with a tassel, elegant and enchanting, centered. She dances with the fan
and a storm of butterflies and flower petals bursts out, pink-violet
energy ribbons spiraling around her spinning form, a pale moon glowing
behind her. She finishes the dance with a fan flourish, butterflies
drifting away.
Epic golden-violet energy effects, dramatic rim lighting, particles,
dark misty battlefield background, cinematic camera work.
No enemies, no other characters, hero only. 4.6 seconds.
```

### 10. 王昭君「落雁曲」· 法师 · 琵琶
> 外观：浅绿+白宽袖长袍、珍珠头饰、花钿、手持琵琶
```
2D ink-wash painting style game hero ultimate skill animation.
Wang Zhaojun, female mage in pale-green and white wide-sleeve robe, pearl
hair ornaments, red forehead mark, playing a pipa lute, centered. Her
plucked strings release ice-crystal shockwaves spreading outward — the
ground freezes in rippling cyan ice around her, falling geese turn into
frost and scatter, snow and frost particles swirl. She lifts her hand
from the strings, frozen ripples glowing around her feet.
Epic golden-violet energy effects, dramatic rim lighting, particles,
dark misty battlefield background, cinematic camera work.
No enemies, no other characters, hero only. 4.6 seconds.
```

### 11. 嫦娥「广寒宫」· 法师 · 玉兔
> 外观：浅绿+白汉服+长披帛、金绿发饰、花钿、**双手捧着绿色玉兔**（无武器）
```
2D ink-wash painting style game hero ultimate skill animation.
Chang'e the moon goddess, pale-green and white hanfu with a long flowing
ribbon, golden-and-green hair ornaments, red forehead mark, holding a
small green jade rabbit in her hands, serene, centered. She raises the
jade rabbit and a silvery moonlight beam descends upon her, the rabbit
glowing softly, the moon palace faintly visible in the night sky, starry
night with gentle holy light. She lowers her hands, moonlight fading into
falling stardust.
Epic golden-violet energy effects, dramatic rim lighting, particles,
dark misty battlefield background, cinematic camera work.
No enemies, no other characters, hero only. 4.6 seconds.
```

### 12. 女娲「补天诀」· 辅助 · 五色石
> 外观：白色镶金胸衣/腰裙+金链饰、**绿色长发+尖耳**、白绿蛇尾黄脊刺、手捧五色晶石
```
2D ink-wash painting style game hero ultimate skill animation.
Nuwa the creator goddess, white-gold attire with golden jewelry, long
green hair and pointed ears, a white-and-green serpentine tail with
yellow spines coiled behind her, holding five-colored glowing crystal
stones, centered. She raises the stones and rainbow light pillars shoot
up to mend a glowing crack in the sky above her, her serpentine figure
framed in heavenly light. She closes her palms, the sky-crack seals,
light fading into gentle rain of light motes.
Epic golden-violet energy effects, dramatic rim lighting, particles,
dark misty battlefield background, cinematic camera work.
No enemies, no other characters, hero only. 4.6 seconds.
```

## 五、批量生成流程

1. **试点**：生成关羽 1 条 → 用户确认风格/时长/画质/形象一致性
2. **批量**：确认后按上表 12 条逐个调用 Agnes API（每条 ~65s 推理，建议脚本串行跑）
3. **验收**：下载 `*-ultimate.mp4`，检查：英雄形象是否稳定、是否误拍敌人/路人、时长 4.5s±
4. **入库**：存到 `assets/heroes/{hero}-ultimate.mp4`，push 到仓库
5. **接前端**：在 `resolveRound` 的 `doubleScoreUsed === true` 处插入全屏大招播放
   （复用现有 intro 播放逻辑，quiz-battle.html:3193-3229 同一套 video+voice+fallback 机制）

## 六、验收清单（每一条视频）

- [ ] 只有目标英雄出镜，无敌人、无路人、无其他角色
- [ ] 英雄形象/武器与 battle sprite 一致（不"换武器"、不跑偏）
- [ ] 时长 4~5s，特效完整（蓄力→释放→爆发→收招）
- [ ] 720p，投屏清晰
- [ ] 结尾适合黑屏淡出（避免跳切突兀）

## 附：外观核对记录（Gemini 视觉，2026-08-19）

| 英雄 | 武器 | 服装主色 | 显著特征 |
|------|------|---------|----------|
| 项羽 | 双头枪 | 金黄鳞甲+绿披风红边 | 高马尾金冠红宝石、短须 |
| 关羽 | 青龙偃月刀 | 白袍+绿边+金饰 | 红褐美髯、武冠 |
| 李白 | 剑+黑剑鞘 | 白色水墨长袍 | 束发、无酒葫芦 |
| 后羿 | 复合弓(金臂绿弦) | 白蓝青绿长袍 | 蓝宝石发冠 |
| 诸葛亮 | 白羽扇 | 浅绿/青绿长袍 | 高冠、山羊胡 |
| 钟馗 | 金饰单手剑 | 深灰黑宽袖袍 | 浓密黑长须、发髻横簪 |
| 花木兰 | 长枪(红缨) | 黑灰重铠+红边金饰 | 高马尾红发绳 |
| 穆桂英 | 红缨长枪 | 铁灰铠甲+暗红 | 发冠红羽红宝石 |
| 貂蝉 | 团扇(圆形宫扇) | 浅绿汉服+刺绣 | 花钿、金发簪 |
| 王昭君 | 琵琶 | 浅绿+白宽袖袍 | 珍珠头饰、花钿 |
| 嫦娥 | 无(捧玉兔) | 浅绿+白+长披帛 | 金绿发饰、花钿 |
| 女娲 | 五色晶石 | 白+金+蛇尾 | 绿长发、尖耳、蛇尾 |
