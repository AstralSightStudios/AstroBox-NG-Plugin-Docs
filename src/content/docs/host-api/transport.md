---
title: Transport 接口
---

用于与穿戴设备进行数据传输与协议转换。

## 接口定义

```wit
interface transport {
    enum protocol {
        XIAOMI-VELA-V5-PROTOBUF,
    }

    send: func(device-addr: string, data: list<u8>) -> future;
    request: func(device-addr: string, data: list<u8>)
        -> future<result<list<u8>>>;
    to-json: func(protocol: protocol, data: list<u8>) -> string;
    from-json: func(protocol: protocol, data: string) -> result<list<u8>>;
}
```

## 类型

### protocol

- `XIAOMI-VELA-V5-PROTOBUF`：基于 Xiaomi Vela 5 的 Protobuf 传输协议

## 函数

### send

- 参数：
  - `device-addr: string` 设备地址。
  - `data: list<u8>` 待发送的二进制数据。
- 返回：`future<()>`。
- 说明：仅发送数据，不等待响应。

### request

- 参数：
  - `device-addr: string` 设备地址。
  - `data: list<u8>` 待发送的二进制数据。
- 返回：`future<result<list<u8>>>`，成功返回响应数据。
- 说明：请求-响应模式。

### to-json

- 参数：
  - `protocol: protocol` 协议类型。
  - `data: list<u8>` 二进制数据。
- 返回：`string`。
- 说明：将协议数据转换为 JSON 字符串，便于日志与调试。

### from-json

- 参数：
  - `protocol: protocol` 协议类型。
  - `data: string` JSON 字符串。
- 返回：`result<list<u8>>`。
- 说明：将 JSON 反序列化为协议二进制数据。不推荐使用。

## Rust 示例

```rust
use crate::astrobox::psys_host;

pub async fn send_packet(addr: &str, data: Vec<u8>) {
    psys_host::transport::send(addr, &data).await;
}

pub async fn request_packet(addr: &str, data: Vec<u8>) -> Option<Vec<u8>> {
    match psys_host::transport::request(addr, &data).await {
        Ok(resp) => Some(resp),
        Err(_) => None,
    }
}
```
