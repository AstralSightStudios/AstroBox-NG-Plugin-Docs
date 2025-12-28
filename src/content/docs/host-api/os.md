---
title: OS 接口
---

提供宿主系统的基础信息查询能力，全部为异步调用。

## 接口定义

```wit
interface os {
    arch: func() -> future<string>;
    hostname: func() -> future<string>;
    locale: func() -> future<string>;
    platform: func() -> future<string>;
    version: func() -> future<string>;
    astrobox-language: func() -> future<string>;
}
```

## 函数

### arch

- 返回：`future<string>`，CPU 架构字符串。

### hostname

- 返回：`future<string>`，宿主设备名称。

### locale

- 返回：`future<string>`，系统 locale 字符串。

### platform

- 返回：`future<string>`，宿主平台标识。

### version

- 返回：`future<string>`，宿主系统版本号。

### astrobox-language

- 返回：`future<string>`，AstroBox 语言设置。

## Rust 示例

```rust
use crate::astrobox::psys_host;

pub async fn print_os_info() {
    let arch = psys_host::os::arch().await;
    let platform = psys_host::os::platform().await;
    let version = psys_host::os::version().await;
    let locale = psys_host::os::locale().await;
    let hostname = psys_host::os::hostname().await;
    let language = psys_host::os::astrobox_language().await;

    tracing::info!("arch={}", arch);
    tracing::info!("platform={}", platform);
    tracing::info!("version={}", version);
    tracing::info!("locale={}", locale);
    tracing::info!("hostname={}", hostname);
    tracing::info!("astrobox_language={}", language);
}
```
