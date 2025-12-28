---
title: Rust 插件开发上手教程
---

---

> 本文面向 **熟悉 Rust 基础，但第一次接触 WASI / WIT / Component Model 的开发者**。
> 目标不是“讲全”，而是 **快速建立正确心智模型 + 跑通最小闭环**。

如果你正在 Vibe Coding，请使用智力足够的模型（推荐 gpt-5.2-codex / gemini-3-pro），最好使用 Agent 类模型，并将此文喂给它。

---

## 何意味？我们要写什么？
<img src="/funnystickers/2.png" width="200" height="200" />

**AstroBox 插件 = 一个 Rust `lib`，被编译成 `wasm32-wasip2` 的 WebAssembly Component**

它绝对他妈的不是：

* 普通 CLI 程序
* WebAssembly for Web
* Tokio Server / 后端服务

而是：

> **一个运行在 AstroBox 宿主里的“受控 Rust 组件”**
> 通过 **WIT 定义好的接口**，和宿主进行 **强类型、异步、安全** 的交互。

---

## 三相之力！

<img src="/funnystickers/1.gif" width="100" height="100" />

必须记住下面这三个概念喵！不然我会在喝完粉色魔爪后用小刀刀捅死你的喵！

### 一、Host / Plugin 不是“进程”，而是“组件边界”

* **Host（AstroBox）**：提供能力（UI、设备、系统、通信）
* **Plugin（你写的 Rust）**：实现逻辑、处理事件、调用 Host

二者之间 **没有共享内存、没有直接 syscall**：一切交互都必须写在 **WIT 接口里**

---

### 二、WIT = 插件和宿主之间的“接口契约”

WIT 文件定义了：

* 可以调用哪些函数
* 数据结构长什么样
* 哪些是同步 / 哪些是异步
* 哪些事件会回调给插件

你 **不需要自己写 ABI / FFI**
`wit-bindgen` 会帮你把它们变成 Rust 代码。

详见 [WIT 文件](../general/wit-files)

---

### 三、`future<T>` ≠ `async fn -> T`

在 **WIT / Component Model** 里：

* `future<T>` 是**跨组件边界的异步承诺**
* Rust 侧表现为：`FutureReader<T>`

这就是为什么你会看到：

```rust
fn on_event(...) -> FutureReader<String>
```

而不是：

```rust
async fn on_event(...) -> String
```

---

## 环境准备

### 1. 安装 Rust

<img src="/funnystickers/rscrab.gif" width="150" height="150" />

👉 [https://www.rust-lang.org/learn/get-started](https://www.rust-lang.org/learn/get-started)

Windows 用户按提示装好 MSVC 即可。

---

### 2. 安装 AstroBox 插件目标

```bash
rustup target add wasm32-wasip2
```

> AstroBox V2 当前基于 WASI Preview 2

> 未来会支持 wasi-p3，但**旧插件无需修改即可继续工作**

---

## 创建你的第一个插件项目

### 克隆项目模板

```bash
git clone --recurse-submodules https://github.com/AstralSightStudios/AstroBox-NG-Plugin-Template-Rust
cd AstroBox-NG-Plugin-Template-Rust
```

---

### 高雅人士观察项目结构
<img src="/funnystickers/b.jpg" width="150" height="150" />

```text
.
├── Cargo.toml
├── src
│   ├── lib.rs        # 插件入口（你主要改的地方）
│   └── logger.rs     # tracing 日志初始化
└── wit               # （submodule）Host / Plugin 的 WIT 接口定义
```

> ⚠️ `wit/` 是 **submodule**，包含 wit 接口定义文件。详见 [WIT 文件](../general/wit-files)

> AstroBox 升级时，只会 **新增接口，不会破坏旧接口**

---

## 初读 `lib.rs`

先别被一大坨宏和impl吓到，来看这三段关键代码：

### 一、`wit_bindgen::generate!`

```rust
wit_bindgen::generate!({
    path: "wit",
    world: "psys-world",
    generate_all,
});
```

它帮你做了三件事：

1. **把 Host 的 WIT 接口导入成 Rust 模块**

   ```rust
   psys_host::dialog::show_dialog(...)
   ```

2. **生成你必须实现的 Guest trait**

   ```rust
   lifecycle::Guest
   event::Guest
   ```

3. **生成异步桥接所需的运行时代码**
   （`FutureReader` / `spawn` / `block_on`）

---

### 二、插件生命周期：`on_load`

```rust
impl lifecycle::Guest for MyPlugin {
    fn on_load() {
        logger::init();
        tracing::info!("Hello AstroBox V2 Plugin!");
    }
}
```

* 插件 **被加载时自动调用**
* 是同步函数
* 非常适合做：

  * 日志初始化
  * 设备扫描
  * register 各种事件

---

### 三、事件入口：`on_event` / `on_ui_event`

```rust
impl event::Guest for MyPlugin {
    fn on_event(...) -> FutureReader<String> { ... }
    fn on_ui_event(...) -> FutureReader<String> { ... }
}
```

这是插件 **90% 逻辑调用的入口**

---

## 什么是他妈的 `FutureReader`？

### 为什么不能直接发动锈术释放 `async fn`？

除了我不喜欢你，我什么都没做错。知名博主 [LexBurner](https://space.bilibili.com/777536) 曾在不经意间被吓一跳释放忍术🥷，在使用 Rust 编写 AstroBox 插件时，你肯定也会忍不住被吓一跳释放锈术，把 `async fn` 扔给 `FutureReader`。

好吧上面是在玩梗，但你的确不能这么做

因为：

> **宿主和插件可能不在同一个 executor / runtime / 线程模型里**

所以 WIT 定义的是：

```wit
on-event: func(...) -> future<string>
```

---

### True, dude
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;———XQC

<img src="/funnystickers/xqc.png" width="100" height="100" />

所以实际上这才是正确写法：

```rust
let (writer, reader) = wit_future::new::<String>(|| "".to_string());

wit_bindgen::spawn(async move {
    // 这里可以 await host 接口
    writer.write("result".to_string()).await.unwrap();
});

reader
```

你可以把它理解为：

> **oneshot channel + promise**

* `reader`：马上还给宿主（“我以后会给你结果”）
* `writer`：某个时刻把结果填回去

---

### `spawn` 是谁的？

```rust
wit_bindgen::spawn(async { ... });
```

杂鱼杂鱼，这才不是什么 tokio 呢～

这是 **Component Model 自带的最小 async runtime**——足够用，且 **WASI 下最稳定**

---

## 在同步函数里调用异步 Host 接口

`on_load` 是同步的，但 Host 接口几乎都是 `future<T>`。

如果你熟悉Rust开发，你肯定马上要发动`tokio::block_on`之力了——没错，但hold on，把它换成`wit_bindgen::block_on`才是真没错：

```rust
wit_bindgen::block_on(async {
    let result = psys_host::dialog::show_dialog(...).await;
});
```

**原则**：

* ✅ 生命周期函数里可以 `block_on`
* ⚠️ 但是请无论如何都不要把 `dialog` 之类需要等待用户操作的异步操作在 `on_load` 中 `block_on`！
* ❌ 事件回调里不要阻塞，直接返回 `FutureReader`

---

## 第一个完整调用闭环：弹一个 Dialog

```rust
psys_host::dialog::show_dialog(
    DialogType::Alert,
    DialogStyle::System,
    &DialogInfo {
        title: "Plugin Alert".into(),
        content: "插件正在运行".into(),
        buttons: vec![DialogButton {
            id: "ok".into(),
            primary: true,
            content: "OK".into(),
        }],
    },
).await;
```

你可以从中总结出 **WIT → Rust 的映射规律**：

| WIT         | Rust                         |
| ----------- | ---------------------------- |
| `enum`      | Rust `enum`                  |
| `record`    | Rust `struct`                |
| `list<T>`   | `Vec<T>`                     |
| `string`    | `String`                     |
| `future<T>` | `.await` / `FutureReader<T>` |

---

## Register → Event：事件是“订阅制”的

**正确流程永远是：**

1. `on_load`

   * `register_xxx(...)`
2. `on_event`

   * 收到对应事件
   * 执行业务逻辑

---

## UI 接口：声明式，而不是模板式或 DOM

<img src="/funnystickers/dui.png" width="250" height="250" />

逃离使用命令式 UI 的 Qt 和尤雨溪统治的 `<template>` 帝国，让我们来拥抱一些真正现代、真正 Next-Gen 的东西——声明式 UI。人人都喜欢 React 和 SwiftUI，除了那些仍在玩弄 WPF 或使用 Vanilla HTML 编写上世纪级页面的老登。

`ui::element` 是一个 **链式 Builder API**

```rust
let btn = ui::element::new(
    ElementType::BUTTON,
    Some("Click me".into())
)
.on(event::Event::CLICK, "btn-click");

ui::render(btn);
```

* 没有 HTML
* 没有 JS
* 没有 CSS

去他妈的 XSS 注入。

---

## Crates.io 生态兼容：你不需要重新发明轮子

<img src="/funnystickers/rw-in-rust.webp" width="350" height="350" />

虽然前面还没提到，但也许你已经发现，模板里的 `logger.rs` 做了三件事：

* stdout 打印（带 `[Plugin]` 前缀）
* 文件滚动日志（`logs/app.log`）

并且，它直接使用了目前 Rust 桌面应用采用的主流方案 [tracing](https://docs.rs/tracing) 库。它并没有为 WebAssembly 特别开发，但由于我们使用了 WASI，大部分 std 操作都得以实现，这些来自 Rust 现存生态的第三方库也能被直接使用。

**因此**：

> WASI ≠ 只能写玩具代码

> 绝大多数纯 Rust 库 **可以直接用**

---

## Tokio？能用，但不推荐

* WASM / WASI 下 tokio 是 **子集支持**
* `full` feature 会展现黑曼巴精神直接坠机
* 定时器、IO 行为大概率没适配 wasi，也不让你过编译

So，**优先使用：**

* `wit_bindgen::spawn`
* `FutureReader`
* Host 提供的能力

---

## 到这里，你已经能做什么了？

你现在已经可以：

* 写一个可加载的 AstroBox 插件
* 调用 Host UI / Device / Transport 接口
* 注册并接收事件
* 正确处理跨组件异步
* 使用标准 Rust 日志与库

接下来只剩两件事：

1. **业务逻辑**
2. **设计好你的插件 UX**

**发挥你的创造力，我们迫不及待地想看看你能在这个充满可能性的平台上做些什么！**

---
