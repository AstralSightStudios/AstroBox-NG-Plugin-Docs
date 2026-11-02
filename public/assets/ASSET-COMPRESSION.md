# 文章配图压缩流程（Asset Compression Runbook）

> 写给后续接手的 Agent / 维护者。
> 本文记录 **2026-11 那次全站配图压缩** 的完整方法与踩过的坑，照此复跑即可，
> 不必重新摸索。所有数字都是实测值，不是估算。

- 目标仓库：`AstralSightStudios/AstroBox-NG-Plugin-Docs-Content`（**内容仓**）
- 涉及目录：`public/assets/images/docs/`、`public/assets/images/blog/`
- 正文引用位置：`content/docs/**/*.mdx`、`content/blog/**/*.mdx`

---

## 0. 一句话结论

**静态图 → WebP（优先无损，逐像素验证；无损变大才用有损 + SSIM ≥ 0.990）；
大动图（录屏）→ H.264 MP4（WebP 动画没有帧间预测，压不动）；
小 GIF 图标 → 缩到 2× 显示宽度后重编码动画 WebP。**

本次结果：**100.1 MB → 36.7 MB（−63%）**，161 个引用 0 悬空，构建通过。

---

## 1. 前置：工具与能力探测

macOS 上需要：

```bash
brew install webp ffmpeg          # cwebp dwebp gif2webp img2webp webpmux webpinfo
```

Python 侧需要 `Pillow` 与 `numpy`（本项目可用 DSH 自带运行时，
`python3 -c "import PIL, numpy"` 探测即可）。

**动手前先探测，不要假设工具存在：**

```bash
for t in cwebp dwebp gif2webp img2webp webpmux webpinfo ffmpeg sips magick pngquant avifenc; do
  printf '%-10s %s\n' "$t" "$(command -v $t || echo MISSING)"
done
ffmpeg -hide_banner -encoders 2>/dev/null | grep -E 'libx264|libvpx-vp9'
```

本次实测环境：`webp` 全家桶 + `ffmpeg`（含 libx264 / libvpx-vp9）可用；
**`magick` / `pngquant` / `oxipng` / `avifenc` 都没有**，所以方案不依赖它们。
`python3` 有 Pillow 12.3 + numpy 2.3（没有 scipy / skimage，所以 SSIM 要自己实现）。

---

## 2. 第 1 步：盘点真实引用（不要用 `find` 猜）

只压「正文真正引用的文件」。引用有三种写法，**必须都覆盖**，否则会漏：

1. Markdown：`![说明](/assets/images/xxx.png)`
2. JSX / HTML：`<img src="..."/>`、`<video poster="..."/>`、`<DocVideo src="..."/>`
3. Frontmatter：`cover: "/assets/images/blog/xxx.jpg"` ← 最容易漏，博客封面全靠它

同时要注意 **代码块里的假引用**（目录树示意，如 `/assets/accent.png` 之类）
是误报，不要去建文件。

盘点脚本（已验证）：

```python
import pathlib, re

MD = r"""
(?:
  !\[[^\]]*\]\(\s*(?P<md><[^>]+>|[^)\s]+)
 |(?:src|poster|cover)\s*[=:]\s*["'](?P<attr>[^"']+)["']
 |["'](?P<bare>/assets/[^"']+)["']
)
"""

def refs_of(root):
    pat = re.compile(MD, re.X)
    found = {}
    for f in list(root.rglob("*.mdx")) + list(root.rglob("*.md")):
        for m in pat.finditer(f.read_text(encoding="utf-8")):
            p = (m.group("md") or m.group("attr") or m.group("bare") or "").strip("<>")
            if p.startswith("/assets/"):
                found.setdefault(p, set()).add(str(f))
    return found

refs = refs_of(pathlib.Path("content"))
disk = {"/" + str(p.relative_to("public"))
        for p in pathlib.Path("public").rglob("*") if p.is_file()}

print("引用数:", len(refs))
print("悬空引用:", [r for r in refs if r not in disk])      # 必须为空
print("引用体积: %.2f MB" % (sum(pathlib.Path("public" + r).stat().st_size
                              for r in refs if r in disk) / 1048576))
```

**基线（本次）**：161 个引用，0 悬空，引用体积 **36.73 MB**（压缩后）。
压缩前为 100.1 MB。

---

## 3. 第 2 步：分类决策树

按 **文件本身**（不是扩展名）判断，用 Pillow 看 `n_frames`：

```
被引用的图片文件
├─ n_frames == 1（静态）
│   ├─ 无损 WebP 比原图小  → 转无损 WebP（逐像素一致，零风险）
│   ├─ 无损反而变大        → 转有损 WebP，SSIM ≥ 0.990 才接受
│   └─ 有损也不达标        → 【向上试 q96–q100 后再放弃】← 见 8.2
├─ n_frames > 1（动图）
│   ├─ 体积大、有连续渐变（录屏 / 演示）→ H.264 MP4  ★收益最大
│   └─ 体积小、图标类（GIF）            → 缩小 + 动画 WebP
```

判断动图是否适合 MP4：**几乎总是适合**。WebP 动画格式**没有帧间预测**，
每一帧都是独立关键帧，所以录屏类动图转 MP4 通常能省 60–90%。
本次 12 段录屏：31.9 MB → 9.0 MB。

---

## 4. 第 3 步：静态图 → WebP

### 4.1 编码命令

```bash
# 无损（注意：绝对不要加 -m）
cwebp -quiet -metadata none -z 9 -alpha_q 100 in.png -o out.webp

# 有损（这里才用 -m）
cwebp -quiet -metadata none -q 95 -m 6 -alpha_q 100 in.jpg -o out.webp
```

> ⚠️ **`-m` 会清掉无损标志**，见 8.1。无损编码不要带 `-m`。

### 4.2 选择策略（照抄即可）

质量阶梯 `95, 90, 85, 80`，从「最小且 ≥ 0.990」里选：

1. 先试无损。**逐像素**（含 alpha 通道）比对一致 **且** 体积更小 → 直接用，收工。
2. 否则跑有损阶梯，取 **体积最小** 的达标者（不是质量最高的那个）。
3. 都不达标 → 见 8.2，**先向上试 q96–q100**，再考虑降采样，最后才放弃。

### 4.3 SSIM 必须自己算

环境里没有 skimage，用 numpy 实现即可（与 skimage 的 `uniform_filter` 语义一致）：

```python
def box(x, r):                      # 7x7 (r=3) 均匀窗滑动均值
    k = 2 * r + 1
    p = np.pad(x, r, mode="reflect")
    c = np.cumsum(np.cumsum(p, 0), 1)
    c = np.pad(c, ((1, 0), (1, 0)))
    return (c[k:, k:] - c[:-k, k:] - c[k:, :-k] + c[:-k, :-k]) / (k * k)

def ssim(a, b, r=3):
    C1, C2 = (0.01 * 255) ** 2, (0.03 * 255) ** 2
    mu1, mu2 = box(a, r), box(b, r)
    s1, s2 = box(a * a, r) - mu1 ** 2, box(b * b, r) - mu2 ** 2
    s12 = box(a * b, r) - mu1 * mu2
    return float((((2 * mu1 * mu2 + C1) * (2 * s12 + C2)) /
                  ((mu1 ** 2 + mu2 ** 2 + C1) * (s1 + s2 + C2))).mean())
```

**在灰度通道上算**（`Image.convert("L")`），并对 alpha 做**逐像素全等**检查。

### 4.4 本次结果

| 分类 | 数量 | 说明 |
|---|---|---|
| 无损、逐像素一致 | 102 | 可以直接视作零风险 |
| 有损、SSIM ≥ 0.990 | 14 | 最低 0.99007，最高 0.99515 |
| 保留原格式 | 26 | 无损反而变大，全是 4–15 KB 的小图 |

静态图整体：**63.5 MB → 27.0 MB**。

> `usage/connection/13.jpg` 一度被漏掉（见 9.1），补做后属于「有损、SSIM 0.99064」，
> 所以上表是补做前的统计口径；补做后它已并入「有损」一档。

---

## 5. 第 4 步：动图 → MP4

### 5.1 为什么不用 WebP / GIF

WebP 动画无帧间预测，GIF 只有 256 色 + LZW，两者对录屏都很浪费。
H.264 有运动补偿，同样的观感能小一个数量级。

### 5.2 关键规则（每条都对应一个坑）

1. **用 Pillow 解码**源动画（`im.seek()` 逐帧），不要用 ffmpeg —— ffmpeg 读不了动画 WebP。
2. **奇数尺寸不能用 `scale` 变偶数**：会重采样并产生半像素位移。
   改为「边缘复制 pad」到偶数宽高，编码后再裁回。
3. **fps = 总帧数 ÷ 总时长(秒)**，不能用固定 25/30，否则时长会变。
4. 质量从 `crf 20` 起，SSIM 不达标再降 crf（16 → 12）提质量。

```python
# 边缘复制 pad 到偶数（零重采样）
arr = np.asarray(canvas).copy()
arr[h:, :] = arr[h - 1 : h, :]
arr[:, w:] = arr[:, w - 1 : w]

fps = len(frames) / (sum(durs) / 1000.0)

subprocess.run([
    "ffmpeg", "-loglevel", "error", "-y",
    "-framerate", f"{fps:.6f}",
    "-i", str(tmp / "f%04d.png"),
    "-c:v", "libx264", "-crf", "20", "-preset", "slow",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an",
    str(out),
], check=True)
```

验收：`ssim_mean ≥ 0.99` 且 `ssim_min ≥ 0.98`（逐帧比，用 rawvideo 管道取回解码帧）。

### 5.3 本次结果（12 段全部 ≥ 0.9905）

| 文件 | 尺寸 | 帧 | 时长 ms | crf | SSIM | 前 | 后 | 省 |
|---|---|---|---|---|---|---|---|---|
| `launch-speed` | 720x707 | 167 | 5566 | 20 | 0.99419 | 3.26 MB | 389 KB | 88% |
| `back-anim` | 720x707 | 124 | 4133 | 20 | 0.99054 | 2.83 MB | 813 KB | 72% |
| `vaul-anim` | 720x707 | 249 | 8300 | 20 | 0.99334 | 4.19 MB | 964 KB | 78% |
| `card-anim` | 720x707 | 190 | 6333 | 20 | 0.99193 | 4.85 MB | 681 KB | 86% |
| `multi-device-connect` | 960x540 | 217 | 7233 | 20 | 0.99316 | 3.21 MB | 599 KB | 82% |
| `mifit-bt-off` | 960x662 | 196 | 10625 | 20 | 0.99529 | 2.00 MB | 837 KB | 59% |
| `iphone-duo` | 800x624 | 243 | 10167 | 20 | 0.99356 | 3.19 MB | 1135 KB | 65% |
| `test-create` | 960x502 | 228 | 10583 | 20 | 0.99643 | 1.21 MB | 465 KB | 62% |
| `test-publish-version` | 960x502 | 403 | 19500 | 20 | 0.99667 | 1.85 MB | 657 KB | 65% |
| `test-invite-code` | 960x502 | 152 | 7042 | 20 | 0.99708 | 0.71 MB | 221 KB | 69% |
| `test-invite-link` | 960x556 | 169 | 7583 | 20 | 0.99671 | 1.16 MB | 343 KB | 71% |
| `test-invite-id` | 960x540 | 531 | 24250 | **16** | 0.99691 | 3.43 MB | 2062 KB | 41% |

`test-invite-id` 帧数多（531 帧 / 24 秒）且内容细碎，crf20 不达标，升到 crf16 才过线。

---

## 6. 第 5 步：小 GIF 图标 → 缩小 + 动画 WebP

GIF 图标的问题往往不是编码，而是**尺寸远超显示尺寸**。
先按 `显示 CSS 宽度 × 2`（2× DPR）定目标宽度：

```bash
img2webp -loop 0 -lossy -q 88 -m 6 -min_size \
  -d 100 f0001.png -d 100 f0002.png ... -o out.webp
```

缩小用 `Image.LANCZOS`。本次两个图标 500×500 / 498×381 → 300 宽，
**4.7 MB → 0.73 MB**，SSIM 0.966 / 0.975，帧数与时长完全保留。

---

## 7. 第 6 步：改写引用

**改名后必须全量核对**，否则线上 404。

- 扩展名变化：`.png/.jpg/.jpeg → .webp`，`.webp(GIF/录屏) → .mp4`
- 只改**正文引用**，不要碰文件名本身的其他部分
- 与 `.webp`/`.mp4` 无关的引用（SVG 图标等）保持不动

改写后立刻再跑一次第 2 步的盘点脚本，**「悬空引用」必须为 0**。

---

## 8. 第 7 步：验证闸门（全绿才算完）

一条都不能省：

```bash
# 1) 引用完整性：重跑第 2 步的盘点脚本 → 悬空必须为 0，体积符合预期
python3 - <<'PY'
# ...（粘贴第 2 步的 refs_of，断言悬空为空）...
PY

# 2) 类型检查 + 构建
pnpm exec tsc --noEmit
pnpm build

# 3) 单测
node --test tests/*.test.mjs

# 4) 产物里真的没有 controls、且 autoplay/muted/playsinline 都在
python3 - <<'PY'
import re
html = open(".next/server/app/blog/2p2p5.html", encoding="utf-8").read()
tags = re.findall(r"<video[^>]*>", html)
def has(t, n): return re.search(rf"\s{n}(=|\s|>)", t, re.I) is not None
print("videos", len(tags),
      "| controls", sum(1 for t in tags if re.search(r"\scontrols(=|\s|>)", t, re.I)),
      "| 缺 autoplay", sum(1 for t in tags if not has(t, "autoPlay")))
PY
```

> ⚠️ 检查 HTML 时注意：React 输出的是 `autoPlay=""` / `playsInline=""`（保留大小写），
> 而 `controlsList="nodownload ..."` 里面**含有 "controls" 字样**。
> 用不区分大小写 + 属性边界（`\scontrols(=|\s|>)`）匹配，否则会得到一堆假警报。

> 🔍 **不要在 docs 页的 HTML 里搜 `/assets/images/...`**：fumadocs-mdx 会把正文里的
> markdown 图片 / `<img>` 编译成**静态导入**，构建后变成带内容哈希的
> `/_next/static/media/<文件名>.<hash>.<扩展名>`，原始路径根本不会出现。
> 而 `<DocVideo src="...">` 和 frontmatter 的 `cover:` 传的是字符串，仍按原路径输出。
> 所以两类引用的验证方式不同：
> - **docs 正文图片** → 靠 `pnpm build` 通过来保证（引用不存在会直接构建失败，
>   比事后检查更可靠）；也可以在 `.next/static/media/` 下按体积找到产物确认。
> - **blog 的 `<video src>` / `cover`** → 在产物 HTML 里能看到原路径，按上面脚本核对。

**`pnpm build` 会重写 `next-env.d.ts`**（`./.next/types` ↔ `./.next/dev/types`），
构建后记得 `git checkout -- next-env.d.ts`。

---

## 9. 坑位清单（每一条都真实发生过）

### 9.1 质量阶梯只能向下，会漏掉大文件 ★最贵的一次

初版阶梯只有 `95, 90, 85, 80`。`docs/usage/connection/13.jpg`（2.78 MB）的
q95 SSIM = 0.98983，差 **0.00017** 没到 0.990，于是整张图被放弃、
一份都没省 —— 而它一个人就占了最终体积的 7%。（**已补做**，见 §10）

事后补测（同一张图）：

| 档位 | 体积 | SSIM | 省 |
|---|---|---|---|
| q95 | 1031 KB | 0.98983 | 65% ✗（差一点点）|
| **q96** | **1151 KB** | **0.99064** | **60% ✓** |
| q98 | 1462 KB | 0.99204 | 49% |

**教训**：不达标时先**向上**试 q96–q100，再考虑降采样，最后才放弃；
并且跑完后必须**按体积倒序回看幸存者**，任何 > 500 KB 的「保留原格式」都要人工复核。

### 9.2 `cwebp -m` 会静默关闭无损 ★最隐蔽

`cwebp -m 6 -z 9 in.png -o out.webp` 不报错，但产出是 **有损 q75**。
本次一度让 143 张图全部被有损重编码，而脚本里还硬编码了 `ssim = 1.0`、
报告写着 "lossless"。

验证方式（唯一可信）：

```bash
cwebp -quiet -z 9 in.png -o a.webp        # → Format: Lossless (2)
cwebp -quiet -m 6 -z 9 in.png -o b.webp   # → Format: Lossy (1)   ← 陷阱
webpinfo -summary a.webp | grep Format
```

并且**逐像素比对**（`np.array_equal`，含 alpha），不要只看体积和返回值。

### 9.3 `webpmux -get frame` 是 1-based

用 0-based 循环会整体错位一帧，SSIM 看起来掉到 0.92，其实是错位而非画质损失。
用 `for i in range(1, n + 1)`（或干脆用 Pillow 解码，别用 webpmux 提帧）。

### 9.4 libwebp 会合并「字节完全相同」的连续帧

167 帧进去可能 157 帧出来 —— **不是丢帧**，是静态段被合并。
所以**不能按帧序号比 SSIM**，要按**时间**取样比较：

```python
def compare_by_time(ref, got, ref_durs, got_durs):  # 在共同时间轴上取样
    ...
```

按时间对齐后 SSIM 回到 0.99+，总时长完全一致（例：5566 ms）。

### 9.5 ffmpeg 读不了动画 WebP

`ffmpeg -i a.webp` 报 `image data not found`。解码一律用 Pillow。

### 9.6 奇数尺寸不要 `scale` 到偶数

`-vf scale=trunc(iw/2)*2:...` 对 720×707 会重采样并位移半像素，SSIM 0.952。
改用边缘复制 pad → 720×708，零重采样，SSIM 0.9865（crf23）/ 0.9905（crf20）。

### 9.7 保守策略会导致引用指向不存在的文件

有 27 张图因为无损反而变大而保留原扩展名，但引用已被批量改成 `.webp`，
一度产生 29 个悬空引用。**改写引用必须以「最终真实落盘的文件」为准**，
改完立刻复跑盘点脚本。

### 9.8 备份在 `/tmp`，重启就没

原图备份放在 `/tmp/astrobox_img/backup`（约 100 MB）。`/tmp` 会被清理，
**真正的兜底是 git 历史**（回滚到压缩前的提交即可）。别把它当长期备份。

### 9.9 提交归属：资源属于内容仓

`public/assets/images/{docs,blog}` 与 `content/**` 都归**内容仓**
（主仓 `.gitignore` 忽略），必须用 `abdocstool.py commit` 或直接提交到
`.subrepo/AstroBox-NG-Plugin-Docs-Content/`，否则会漏提交。
详见 `AGENTS.md`。

---

## 10. 遗留问题（下次可以顺手做）

1. ~~**`docs/usage/connection/13.jpg`**~~ —— **已补做**：q96 转 WebP，
   2.78 MB → 1.15 MB（SSIM 0.99064，像素尺寸不变，仍是 3072×4096），
   引用已同步改写为 `.webp`。
   若还想更小，可再降到 1536 宽（2× DPR）；但降采样会**改变像素尺寸**，
   属于「减少信息」而非「无损重编码」，需接受 3× 以上 DPR 屏幕上的轻微软化。
2. **孤儿文件 12 个 / 1.42 MB** —— 已无任何引用：
   `2p2p5blog.jpg`(738 KB)、`usage/account/1.png`(365 KB)、`usage/account/5.png`(77 KB)、
   `canopus/IMG_3613.jpg`(200 KB)、`account/casdoor-icon.png`、两个 `github-invertocat-*.svg`、
   以及 4 个 `.DS_Store`。确认无用后可删。
3. **超大「已压」文件** —— 以下 WebP 仍 > 1 MB，多数是 3072+ 宽的截图，
   降采样到 2× 显示宽度还能再省一半：
   `creator-tools/account/2.webp`(1.37 MB)、`creator-tools/account/3.webp`(1.04 MB)、
   `usage/connection/11.webp`(1.23 MB)、`usage/connection/9.webp`(1.10 MB)、
   `usage/connection/10.webp`(1.02 MB)。
4. **`test-invite-id.mp4`** 2.06 MB 仍是最大视频（531 帧 / 24 秒）。
   可考虑裁掉冗余时段或降到 720 宽。
5. **`<video>` 的播放语义**只在构建产物和 jsdom 里验证过，
   未在真实 Safari/iOS 上手测 `playsInline` 行为。

---

## 11. 组件侧约定（压缩方案的配套）

动图改用 `<video>` 后，正文写法是：

```mdx
<DocVideo src="/assets/images/blog/xxx/demo.mp4" alt="说明" width={960} height={540} />
```

`DocVideo`（`src/components/doc-video.tsx`）保证：

- `autoPlay loop muted playsInline` + `controls={false}` + `disablePictureInPicture`
- 不出现任何播放器控制条、不出现画中画按钮
- 点击放大，动画与图片放大**完全一致**（FLIP：`transform 300ms ease` +
  背景 `background-color 300ms ease`，`prefers-reduced-motion` 时降到 0.01ms），
  几何计算见 `src/lib/video-zoom.ts`，等价性测试直接对照
  `react-medium-image-zoom` 的 `getStyleModalImg`
- 放大时接续原播放进度，不会从头重播
- 点击任意处 / 按 `Esc` 关闭，关闭后焦点回到触发元素

**两个小 GIF 图标刻意保留 `<img>` + 动画 WebP**，以保住 `width/height`
和与图片一致的缩放行为。

---

## 12. 快速复跑清单

```
[ ] 1. 探测工具（cwebp / webpmux / webpinfo / ffmpeg / Pillow / numpy）
[ ] 2. 盘点引用 → 悬空必须为 0，记录基线体积
[ ] 3. 备份原图（知道它会被清掉）
[ ] 4. 静态图：无损优先（不带 -m）→ 无损变大才有损（≥0.990）
[ ] 5. 有损不达标 → 向上试 q96–q100 → 再考虑降采样 → 最后才放弃
[ ] 6. 动图：Pillow 解码 → pad 到偶数 → fps=帧数/时长 → crf20 起
[ ] 7. 小 GIF：缩到 2× 显示宽 → img2webp
[ ] 8. 按最终落盘文件改写引用 → 复跑盘点，悬空 = 0
[ ] 9. tsc + build + tests + 产物 HTML 属性检查
[ ] 10. 按体积倒序回看幸存者，>500 KB 的逐个复核
[ ] 11. 清理孤儿文件与 .DS_Store
[ ] 12. 提交到「内容仓」（abdocstool.py commit）
```
