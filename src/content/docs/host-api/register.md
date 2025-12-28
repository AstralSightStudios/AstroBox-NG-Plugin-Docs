---
title: Register 接口
---

用于注册插件能力（卡片、Provider、Transport 接收、Interconnect 接收等）。

## 接口定义

```wit
interface register {
    record transport-recv-filer {
        xiaomi-vela-v5-channel-id: u32,
        xiaomi-vela-v5-protobuf-typeid: u32,
    }

    enum provider-type {
        URL,
        CUSTOM
    }

    enum card-type {
        ELEMENT,
        TEXT
    }

    register-transport-recv: func(addr: string, filter: transport-recv-filer) -> future<result>;
    register-interconnect-recv: func(addr: string, pkg-name: string) -> future<result>;
    register-deeplink-action: func() -> future<result>;
    register-provider: func(name: string, provider-type: provider-type) -> future<result>;
    register-card: func(card-type: card-type, id: string, name: string) -> future<result>;
}
```

## 类型

### transport-recv-filer

- `xiaomi-vela-v5-channel-id`：Vela V5 通道 ID。
- `xiaomi-vela-v5-protobuf-typeid`：Vela V5 Protobuf 类型 ID。

### provider-type

- `URL`：URL 型 Provider。
- `CUSTOM`：自定义 Provider。

### card-type

- `ELEMENT`：元素卡片，与 `ui::render-to-element-card` 配合。
- `TEXT`：纯文本卡片，与 `ui::render-to-text-card` 配合。

## 函数

### register-transport-recv

根据过滤条件订阅设备端发送来的消息，将以 `transport-packet` 为事件类型调用 Plugin 端的 `on_event` 函数，支持订阅多个条件或设备

- 参数：
  - `addr: string` 设备地址。
  - `filter: transport-recv-filer` 接收过滤条件。
- 返回：`future<result>`。

### register-interconnect-recv

根据过滤条件订阅设备端快应用发送来的 Interconnect 消息，将以 `interconnect-message` 为事件类型调用 Plugin 端的 `on_event` 函数，支持订阅多个包名或设备

- 参数：
  - `addr: string` 设备地址。
  - `pkg-name: string` 快应用包名。
- 返回：`future<result>`。

### register-deeplink-action

订阅插件 DeepLink 事件，订阅后在浏览器中打开 `astrobox://open?source=openPlugin&pluginName=<plugin_name>&data=<plugin_data>` 并拉起 AstroBox 后，将以 `deeplink-action` 为事件类型调用 Plugin 端的 `on_event` 函数，`data` 中的字符串内容将作为 `event-payload`，只支持订阅一次

- 返回：`future<result>`。
- 说明：将插件注册为 Deeplink 行为处理方。

### register-provider

注册一个社区源。类型为 URL 时，仅支持 GitHub 上的仓库，结构必须与 AstroBox 官方源一致，并提供指向 `index_v2.csv` 的URL。类型为 Custom 时，将在执行社区源操作（如拉取资源列表、获取资源详情）时以 `provider-action` 为事件类型调用 Plugin 端的 `on_event` 函数，并在 `event-payload` 中提供操作类型与操作参数，你需要返回对应的数据。支持注册多个社区源

- 参数：
  - `name: string` Provider 名称。
  - `provider-type: provider-type` Provider 类型。
- 返回：`future<result>`。

### register-card

注册一个设备详情页卡片，类型为 Text 时只支持渲染纯文本，类型为 Element 时支持渲染 UI Element。支持注册多个详情页卡片

- 参数：
  - `card-type: card-type` 卡片类型。
  - `id: string` 卡片标识。
  - `name: string` 卡片展示名称。
- 返回：`future<result>`。

## Rust 示例

```rust
use crate::astrobox::psys_host;

pub async fn register_card() {
    psys_host::register::register_card(
        psys_host::register::CardType::Text,
        "demo-card",
        "示例卡片",
    )
    .await
    .unwrap();
}
```
