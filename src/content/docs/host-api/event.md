---
title: Event 接口
---

向其它插件发送事件。

## 接口定义

```wit
interface event {
    send-event: func(event-name: string, payload: string);
}
```

## 函数

### send-event

- 参数：
  - `event-name: string` 事件名。
  - `payload: string` 事件载荷字符串（通常为 JSON）。
- 返回：`()`。

## Rust 示例

```rust
use crate::astrobox::psys_host;

pub fn send_event() {
    psys_host::event::send_event("plugin-ready", "{\"ok\":true}");
}
```
