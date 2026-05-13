# Tasks

## 1. 批量上传

允许用户一次选择多张图片，批量添加到衣橱中。每张图片独立走 background removal + categorization 流程。

## 2. 手动填充优先于自动分析

- 允许用户在 AI 自动 analyzing 期间手动编辑 item 的 details（category、subcategory、color、season、occasion）
- 当检测到用户已手动填充某字段时，自动分析完成后**不覆盖**该字段
- 如果用户在分析完成前已填完所有字段，取消当前图片的 analyzing 流程

## 3. 中文语言配置

添加中文语言支持，覆盖 UI 文本、分类名称、选项标签等。
