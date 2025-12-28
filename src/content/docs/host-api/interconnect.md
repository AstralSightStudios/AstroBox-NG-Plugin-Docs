---
title: Interconnect 接口
---

与穿戴设备上的快应用通信。

## 接口定义

```wit
interface interconnect {
    send-qaic-message: func(device-addr: string, pkg-name: string, data: string) -> future<result>;
}
```

## 函数

### send-qaic-message

- 参数：
  - `device-addr: string` 设备地址。
  - `pkg-name: string` 快应用包名。
  - `data: string` 发送数据字符串。
- 返回：`future<result>`。

## Rust 示例

```rust
use crate::astrobox::psys_host;

pub async fn send_message(addr: &str) {
    psys_host::interconnect::send_qaic_message(
        addr,
        "com.example.app",
        "{\"hello\":1}",
    )
    .await
    .unwrap();
}
```
