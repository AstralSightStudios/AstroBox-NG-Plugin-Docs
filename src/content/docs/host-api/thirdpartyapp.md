---
title: ThirdpartyApp 接口
---

管理和启动第三方应用。

## 接口定义

```wit
interface thirdpartyapp {
    record app-info {
        package-name: string,
        fingerprint: list<u32>,
        version-code: u32,
        can-remove: bool,
        app-name: string
    }

    launch-qa: func(addr: string, app-info: app-info, page-name: string) -> future<result>;
    get-thirdparty-app-list: func(addr: string) -> future<result<list<app-info>>>;
}
```

## 类型

### app-info

- `package-name`：包名。
- `fingerprint`：签名指纹。
- `version-code`：版本号。
- `can-remove`：是否允许卸载。
- `app-name`：应用名称。

## 函数

### launch-qa

- 参数：
  - `addr: string` 设备地址。
  - `app-info: app-info` 目标应用信息。
  - `page-name: string` 目标页面。
- 返回：`future<result>`。

### get-thirdparty-app-list

- 参数：`addr: string` 设备地址。
- 返回：`future<result<list<app-info>>>`。

## Rust 示例

```rust
use crate::astrobox::psys_host;

pub async fn list_apps(addr: &str) {
    let ret = psys_host::thirdpartyapp::get_thirdparty_app_list(addr).await;
    if let Ok(apps) = ret {
        for app in apps {
            tracing::info!("{} ({})", app.app_name, app.package_name);
        }
    }
}
```
