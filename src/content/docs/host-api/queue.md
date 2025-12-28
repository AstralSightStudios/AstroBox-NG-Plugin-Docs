---
title: Queue 接口
---

向 AstroBox 资源队列添加任务。

## 接口定义

```wit
interface queue {
    enum resource-type {
        quickapp,
        watchface,
        firmware
    }

    add-resource-to-queue: func(res-type: resource-type, file-path: string);
}
```

## 类型

### resource-type

- `quickapp`：快应用资源。
- `watchface`：表盘资源。
- `firmware`：固件资源。

## 函数

### add-resource-to-queue

- 参数：
  - `res-type: resource-type` 资源类型。
  - `file-path: string` 本地文件路径。
- 返回：`()`。

## Rust 示例

```rust
use crate::astrobox::psys_host;

pub fn add_firmware(path: &str) {
    psys_host::queue::add_resource_to_queue(
        psys_host::queue::ResourceType::Firmware,
        path,
    );
}
```
