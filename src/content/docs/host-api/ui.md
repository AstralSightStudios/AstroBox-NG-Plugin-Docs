---
title: UI 接口
---

用于构建宿主 UI 卡片。该接口提供链式 Builder 风格的元素描述，并由宿主渲染。

## 接口定义

```wit
interface ui {
    enum element-type {
        BUTTON,
        IMAGE,
        VIDEO,
        AUDIO,
        SVG,
        DIV,
        SPAN,
        P,
    }

    resource element{
        constructor(element-type:element-type,content:option<string>);
        content:func(content:option<string>) -> element;

        flex:func() -> element;

        margin:func(margin:u32) -> element;
        margin-top:func(margin:u32) -> element;
        margin-bottom:func(margin:u32) -> element;
        margin-left:func(margin:u32) -> element;
        margin-right:func(margin:u32) -> element;

        padding:func(padding:u32) -> element;
        padding-top:func(padding:u32) -> element;
        padding-bottom:func(padding:u32) -> element;
        padding-left:func(padding:u32) -> element;
        padding-right:func(padding:u32) -> element;

        align-center:func() -> element;
        align-end:func() -> element;
        align-start:func() -> element;

        justify-center:func() -> element;
        justify-start:func() -> element;
        justify-end:func() -> element;

        bg:func(color:string) -> element;
        text-color:func(color:string) -> element;

        size:func(size:u32) -> element;
        width:func(width:u32) -> element;
        height:func(height:u32) -> element;
        radius:func(radius:u32) -> element;
        border:func(width:u32,color:string) -> element;

        relative:func() -> element;
        absolute:func() -> element;

        top:func(position:u32) -> element;
        bottom:func(position:u32) -> element;
        left:func(position:u32) -> element;
        right:func(position:u32) -> element;

        opacity:func(opacity:f32) -> element;
        transition:func(transition:string) -> element;

        z-index:func(z:s32) -> element;
        disabled:func() -> element;

        child:func(child:element) -> element;

        on:func(event:event,id:string) -> element;
    }

    enum event {
        CLICK,
        HOVER,
        CHANGE,
        POINTER-DOWN,
        POINTER-UP,
        POINTER-MOVE,
    }

    render:func(el:element);
    render-to-element-card:func(id:string,el:element);
    render-to-text-card:func(id:string,text:string);
}
```

## 核心概念

- `element` 资源是链式 Builder，方法调用返回新的 `element`。
- `element-type` 决定元素的语义与渲染方式。
- `event` 用于绑定交互事件。

## 元素类型

- `BUTTON` / `IMAGE` / `VIDEO` / `AUDIO` / `SVG` / `DIV` / `SPAN` / `P`

## 事件类型

- `CLICK` / `HOVER` / `CHANGE` / `POINTER-DOWN` / `POINTER-UP` / `POINTER-MOVE`

## 链式构建方法

### 创建与内容

- `element::new(element-type, content)`：创建元素，可选内容。
- `content(content)`：更新元素内容。

### 布局与对齐

- `flex()`：使用 Flex 布局。
- `align-start()` / `align-center()` / `align-end()`：交叉轴对齐。
- `justify-start()` / `justify-center()` / `justify-end()`：主轴对齐。

### 间距

- `margin(margin)` / `margin-top(margin)` / `margin-bottom(margin)` / `margin-left(margin)` / `margin-right(margin)`
- `padding(padding)` / `padding-top(padding)` / `padding-bottom(padding)` / `padding-left(padding)` / `padding-right(padding)`

### 视觉样式

- `bg(color)`：背景色。
- `text-color(color)`：文字颜色。
- `radius(radius)`：圆角。
- `border(width, color)`：边框。

### 尺寸

- `size(size)` / `width(width)` / `height(height)`

### 位置与层级

- `relative()` / `absolute()`
- `top(position)` / `bottom(position)` / `left(position)` / `right(position)`
- `z-index(z)`

### 状态与动效

- `opacity(opacity)`
- `transition(transition)`
- `disabled()`

### 结构与事件

- `child(child)`：追加子元素。
- `on(event, id)`：绑定事件并指定标识。

## 渲染函数

- `render(el)`：渲染到插件功能页。
- `render-to-element-card(id, el)`：渲染到指定元素卡片，`id` 需先通过 `register::register_card` 注册。
- `render-to-text-card(id, text)`：渲染纯文本卡片。

## Rust 示例

```rust
use crate::astrobox::psys_host::ui::{self, ElementType};

pub fn render_element_card() {
    let button = ui::element::new(ElementType::BUTTON, Some("开始同步".into()))
        .padding(10)
        .radius(8)
        .bg("#2B5BE8".into())
        .text_color("#FFFFFF".into());

    let root = ui::element::new(ElementType::DIV, None)
        .flex()
        .justify_center()
        .align_center()
        .padding(16)
        .child(button);

    ui::render_to_element_card("main-card", root);
}
```
