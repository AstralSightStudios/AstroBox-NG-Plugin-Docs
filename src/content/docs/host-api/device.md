---
title: Device 接口
---

用于获取与管理设备列表。

## 接口定义

```wit
interface device {
    record device-info {
        name: string,
        addr: string
    }

    get-device-list: func() -> future<list<device-info>>;
    get-connected-device-list: func() -> future<list<device-info>>;
    disconnect-device: func(addr: string) -> future<result>;
}
```

## 类型

### device-info

- `name`：设备名称。
- `addr`：设备地址，作为其他接口的 `device-addr` 入参。

## 函数

### get-device-list

- 返回：`future<list<device-info>>`，宿主可识别的全部设备。

### get-connected-device-list

- 返回：`future<list<device-info>>`，当前已连接设备。

### disconnect-device

- 参数：`addr: string` 设备地址。
- 返回：`future<result>`。

## Rust 示例

```rust
use crate::astrobox::psys_host;

pub async fn list_devices() {
    let devices = psys_host::device::get_device_list().await;
    for d in devices {
        tracing::info!("{} ({})", d.name, d.addr);
    }
}
```
