---
title: Dialog 接口
---

用于在宿主 UI 中弹出系统级或 Web 风格对话框，并提供文件选择能力。

## 接口定义

```wit
interface dialog {
    enum dialog-type {
        ALERT,
        INPUT
    }

    enum dialog-style {
        WEBSITE,
        SYSTEM
    }

    record dialog-button {
        id: string,
        primary: bool,
        content: string
    }

    record dialog-info {
        title: string,
        content: string,
        buttons: list<dialog-button>
    }

    record dialog-result {
        clicked-btn-id: string,
        input-result: string
    }

    record pick-config {
        read: bool,
        copy-to: option<string>,
    }

    record filter-config {
        multiple: bool,
        extensions: list<string>,
        default-directory: string,
        default-file-name: string,
    }

    record pick-result {
        name: string,
        data: list<u8>,
    }

    show-dialog:
        func(dialog-type: dialog-type,
             style: dialog-style,
             info: dialog-info)
        -> future<dialog-result>;

    pick-file: func(config: pick-config, filter: filter-config)
        -> future<pick-result>;
}
```

## 类型

### dialog-type

- `ALERT`：提示/确认框。
- `INPUT`：带输入框的对话框。

### dialog-style

- `WEBSITE`：Web 风格。
- `SYSTEM`：系统原生风格。

### dialog-button

- `id`：按钮标识，回传到结果。
- `primary`：是否为主按钮。
- `content`：按钮文字。

### dialog-info

- `title`：标题。
- `content`：内容正文。
- `buttons`：按钮列表。

### dialog-result

- `clicked-btn-id`：点击按钮的 `id`。
- `input-result`：输入内容，仅 `INPUT` 类型会有值。

### pick-config

- `read`：是否由宿主读取文件内容。
- `copy-to`：可选复制目标路径。

### filter-config

- `multiple`：是否允许多选。
- `extensions`：可选扩展名过滤。
- `default-directory`：默认打开目录。
- `default-file-name`：默认文件名。

### pick-result

- `name`：文件名。
- `data`：文件内容字节，是否返回取决于 `pick-config.read`。

## 函数

### show-dialog

- 参数：
  - `dialog-type: dialog-type` 对话框类型。
  - `style: dialog-style` UI 风格。
  - `info: dialog-info` 展示信息。
- 返回：`future<dialog-result>`。

### pick-file

- 参数：
  - `config: pick-config` 读取与复制配置。
  - `filter: filter-config` 过滤与默认路径配置。
- 返回：`future<pick-result>`。

## Rust 示例

```rust
use crate::{
    astrobox::psys_host::{
        self,
        dialog::{DialogButton, DialogInfo, FilterConfig, PickConfig},
    },
};

pub async fn show_alert() {
    let ret = psys_host::dialog::show_dialog(
        psys_host::dialog::DialogType::Alert,
        psys_host::dialog::DialogStyle::System,
        &DialogInfo {
            title: "插件 Alert".to_string(),
            content: "该插件正在 AstroBox V2 的 WASI 插件系统中运行".to_string(),
            buttons: vec![
                DialogButton {
                    id: "ok".to_string(),
                    primary: true,
                    content: "好样的！".to_string(),
                },
                DialogButton {
                    id: "cancel".to_string(),
                    primary: false,
                    content: "算了".to_string(),
                },
            ],
        },
    )
    .await;

    tracing::info!("clicked_btn_id={}", ret.clicked_btn_id);
    tracing::info!("input_result={}", ret.input_result);
}

pub async fn pick_file() {
    let ret = psys_host::dialog::pick_file(
        &PickConfig {
            read: true,
            copy_to: None,
        },
        &FilterConfig {
            multiple: false,
            extensions: vec!["png".into(), "jpg".into()],
            default_directory: "".into(),
            default_file_name: "".into(),
        },
    )
    .await;

    tracing::info!("picked_name={}", ret.name);
    tracing::info!("picked_bytes={}", ret.data.len());
}
```

## 注意事项

- `show_dialog` 必须在宿主事件循环存活期间调用。
- 在 `on_load` 中调用时，应使用异步 spawn。
