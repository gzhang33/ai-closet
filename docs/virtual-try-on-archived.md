# Virtual Try-On 功能归档说明

**归档日期**: 2026-05-13
**状态**: 已禁用（`ENABLE_VIRTUAL_TRY_ON = false`）

---

## 功能概述

Virtual Try-On（虚拟试穿）功能允许用户上传人物照片和服装图片，通过 AI 生成试穿效果图。该功能位于底部导航栏的 "Try-On" Tab 中。

## 归档原因

### 1. 云端 API 成本问题

当前集成的两个云端 API 均不可用：

| Provider | API 域名 | 模型 | 状态 | 单价 |
|----------|---------|------|------|------|
| Kling 国际版 | `api.klingai.com` | kolors-virtual-try-on-v1 | 余额不足 | - |
| Kling 中国版 | `api-beijing.klingai.com` | kolors-virtual-try-on-v1-5 | 余额不足（图像生成包≠虚拟试穿包） | ¥0.5/次 |

- Kling 国际版账户余额已耗尽
- Kling 中国版购买了「图像生成资源包」但虚拟试穿需要单独购买「虚拟试穿资源包」
- 两个平台的 JWT 鉴权和 API 连接均已验证正常

### 2. 本地模型不可行

在 Apple M3 (16GB) 上的 CatVTON 本地评估结果：

| 分辨率 | 成功率 | 平均推理时间 | 峰值内存 |
|--------|--------|------------|---------|
| 384x512 | 100% | 78s | 1938MB |
| 768x1024 | 0% (OOM) | - | - |

- 整体成功率 50%，评定为 "Not Suitable"
- 384x512 可运行但质量偏低，78s 推理时间过长
- 768x1024 需要 18GB 显存，超出 16GB 限制

### 3. 免费 HuggingFace Spaces 不可靠

| Space | 状态 | 问题 |
|-------|------|------|
| Kolors VTO | 不可用 | 未暴露 API 端点 |
| Miragic VTO | 崩溃 | CPU 运行，2 分钟后内部错误 |
| Leffa (MIT) | 超时 | ZeroGPU 120s 时长限制 |

---

## 恢复方法

将 `src/navigation/index.tsx` 中的 feature flag 改为 `true`：

```typescript
const ENABLE_VIRTUAL_TRY_ON = true;
```

恢复前需确保至少一个 API Provider 可用：

1. **Kling 中国版**（推荐）：登录 [klingai.com/dev](https://klingai.com/dev) 购买「虚拟试穿资源包」，然后在 `.env` 中配置：
   ```
   EXPO_PUBLIC_KLING_ACCESS_KEY=<your_key>
   EXPO_PUBLIC_KLING_SECRET_KEY=<your_key>
   ```

2. **Kling 国际版**：充值后使用 `.env` 中的 `EXPO_PUBLIC_KWAI_ACCESS_KEY` / `EXPO_PUBLIC_KWAI_SECRET_KEY`

3. **fal.ai**：充值后在 `.env` 中配置 `EXPO_PUBLIC_FAL_KEY`，并新增对应的 provider 接入

---

## 相关文件

### 核心代码（保留，未删除）

- `src/services/VirtualTryOn.ts` — API 调用服务（支持 Kling 中国版/国际版）
- `src/config/ai.ts` — Provider 配置（`virtualTryOnProvider` / `getVirtualTryOnApiBase()` 等）
- `src/contexts/VirtualTryOnContext.tsx` — 试穿历史 Context
- `src/screens/VirtualTryOnScreen.tsx` — 主界面
- `src/components/virtualTryOn/` — UI 组件目录
- `src/types/VirtualTryOn.ts` — 类型定义

### 导航控制

- `src/navigation/index.tsx` — `ENABLE_VIRTUAL_TRY_ON` feature flag
- `src/types/navigation.ts` — `TryOnStackParamList` 类型（保留）

### 评估报告

- `eval/catvton-eval/results/report.md` — CatVTON Apple Silicon 可行性报告
- `eval/catvton-eval/results/kling_china_result.json` — Kling 中国版 API 测试结果
- `eval/catvton-eval/results/kwai_result.json` — Kling 国际版 API 测试结果
- `eval/catvton-eval/results/hf_spaces_result.json` — HuggingFace Spaces 测试结果

---

## 替代方案参考（低优先级）

| 平台 | 单价 | 特点 |
|------|------|------|
| fal.ai | ~¥0.02-0.1/张 | 多种模型，GPU 按秒计费 |
| Replicate | ~¥0.01-0.07/张 | IDM-VTON, A100 |
| FASHN | $0.075/张 | 生产级，10 免费积分 |
| HuggingFace Spaces (Leffa) | 免费 | MIT 许可，但不稳定 |
