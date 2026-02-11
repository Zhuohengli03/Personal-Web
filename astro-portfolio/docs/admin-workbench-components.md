# 后台工作台组件与样式使用说明

> 后台（Admin）使用的 UI 组件、样式体系及具体用法，便于在相似项目中复用或扩展。

---

## 一、技术栈概览

| 类别 | 技术 |
|------|------|
| 样式框架 | **Tailwind CSS** |
| 组件库 | **shadcn/ui**（基于 Radix UI + CVA），位于 `src/components/ui/` |
| 工具函数 | `cn()`（clsx + tailwind-merge）用于合并 class，`@/lib/utils` |
| 主题变量 | `admin/admin.css` 中定义 `:root` / `.dark` 的 CSS 变量（--background、--primary 等） |
| 全局布局 | `SidebarProvider` + `Sidebar` + `SidebarInset`（侧栏 + 主内容区） |
| 轻提示 | **sonner**（`Toaster` 组件 + `toast()` 调用） |

---

## 二、使用的 UI 组件及路径

| 组件 | 路径 | 说明 |
|------|------|------|
| Button | `@/components/ui/button` | 按钮，支持 variant / size |
| Card, CardHeader, CardTitle, CardContent | `@/components/ui/card` | 卡片容器与标题、内容区 |
| Input | `@/components/ui/input` | 单行输入框 |
| Table, TableHeader, TableBody, TableRow, TableHead, TableCell | `@/components/ui/table` | 表格 |
| Badge | `@/components/ui/badge` | 标签/徽章 |
| Skeleton | `@/components/ui/skeleton` | 骨架屏 |
| Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter | `@/components/ui/sheet` | 侧滑抽屉（基于 Radix Dialog） |
| Sidebar* | `@/components/ui/sidebar` | 侧栏（Provider/Header/Content/Menu/Trigger/Inset/Rail） |
| Toaster | `@/components/ui/sonner` | 全局 Toast 容器 |

\* Sidebar 内部会用到 `@/components/ui/sheet` 和 `@/components/ui/button`。

---

## 三、各组件具体用法

### 3.1 Button

**导入：**
```tsx
import { Button } from '@/components/ui/button';
```

**Props：** 除原生 `button` 属性外，支持：
- `variant`: `'default'` | `'destructive'` | `'outline'` | `'secondary'` | `'ghost'` | `'link'`
- `size`: `'default'` | `'sm'` | `'lg'` | `'icon'`
- `asChild`: 为 true 时渲染为子元素（配合 Radix Slot）
- `className`: 追加 Tailwind 类

**示例：**
```tsx
<Button onClick={handleSave}>保存</Button>
<Button variant="outline" size="sm" onClick={onCancel}>取消</Button>
<Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground" onClick={onBack}>返回</Button>
<Button variant="destructive" onClick={handleDelete}>删除</Button>
<Button variant="secondary" size="lg">大号次要按钮</Button>
```

---

### 3.2 Card（CardHeader / CardTitle / CardContent）

**导入：**
```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
```

**用法：** 纯布局组件，无额外 props，用 `className` 覆盖样式。

**示例：**
```tsx
<Card className="rounded-xl shadow-sm border bg-card">
  <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
    <CardTitle className="text-base font-semibold">标题</CardTitle>
    <Button variant="outline" size="sm">操作</Button>
  </CardHeader>
  <CardContent className="pt-0">
    内容区，默认 p-6 pt-0
  </CardContent>
</Card>
```

常见搭配：`rounded-xl`、`shadow-sm`、`border`、标题区 `flex flex-row justify-between`、内容区 `pt-0` 与上方紧凑。

---

### 3.3 Input

**导入：**
```tsx
import { Input } from '@/components/ui/input';
```

**用法：** 与原生 `<input>` 用法一致，支持 `type`、`value`、`onChange`、`placeholder`、`disabled` 等；通过 `className` 追加样式。

**示例：**
```tsx
<Input
  type="search"
  placeholder="输入关键词搜索…"
  value={searchValue}
  onChange={(e) => onSearchChange?.(e.target.value)}
  className={cn('bg-muted/50', 'max-w-md')}
/>
<Input
  type="text"
  value={editRow.name}
  onChange={(e) => setEditRow({ ...editRow, name: e.target.value })}
  className="text-sm"
/>
```

默认已带：圆角、边框、focus 环、placeholder 颜色、disabled 样式。

---

### 3.4 Table（TableHeader / TableBody / TableRow / TableHead / TableCell）

**导入：**
```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
```

**用法：** 语义化表格结构，外层 `Table` 自带 `overflow-auto` 的 wrapper。

**示例：**
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[160px]">时间</TableHead>
      <TableHead className="w-[120px]">用户</TableHead>
      <TableHead>操作</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {items.map((row) => (
      <TableRow key={row.id}>
        <TableCell className="text-xs text-muted-foreground">{row.created_at}</TableCell>
        <TableCell className="font-medium truncate">{row.name}</TableCell>
        <TableCell>
          <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>编辑</Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

常用 class：表头 `TableHead` 用 `whitespace-nowrap`、`w-[…]` 控制列宽；单元格 `TableCell` 用 `text-muted-foreground`、`truncate`、`font-mono`、`text-xs` 等。

---

### 3.5 Badge

**导入：**
```tsx
import { Badge } from '@/components/ui/badge';
```

**Props：**
- `variant`: `'default'` | `'secondary'` | `'outline'` | `'success'` | `'warning'`
- `className`、children 等

**示例：**
```tsx
<Badge variant="secondary">{subjectLabel(m.subject)}</Badge>
<Badge variant="success">已处理</Badge>
<Badge variant="warning">待处理</Badge>
<Badge variant="outline">仅查看</Badge>
```

---

### 3.6 Skeleton

**导入：**
```tsx
import { Skeleton } from '@/components/ui/skeleton';
```

**用法：** 占位块，默认 `animate-pulse rounded-md bg-muted`，用 `className` 控制尺寸。

**示例：**
```tsx
<Skeleton className="h-10 w-full rounded-lg mb-3" />
<Skeleton className="h-8 w-20 rounded mb-2" />
<Skeleton className="h-4 w-24 rounded" />
```

---

### 3.7 Sheet（侧滑抽屉）

**导入：**
```tsx
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
```

**用法：** `Sheet` 控制开关（open / onOpenChange），`SheetContent` 为滑出层，可指定 `side="right"` 或 `"left"`。

**示例：**
```tsx
<Sheet open={open} onOpenChange={onOpenChange}>
  <SheetContent side="right" className="flex flex-col w-full sm:max-w-lg overflow-y-auto">
    <SheetHeader>
      <SheetTitle>留言详情</SheetTitle>
    </SheetHeader>
    <div className="flex-1 overflow-y-auto py-4">
      {/* 正文 */}
    </div>
    <SheetFooter className="flex-row flex-wrap gap-2 sm:justify-start">
      <Button size="sm" onClick={onMarkProcessed}>标记已处理</Button>
      <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>关闭</Button>
    </SheetFooter>
  </SheetContent>
</Sheet>
```

---

### 3.8 Sidebar（侧栏布局）

**导入：**
```tsx
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useSidebar } from '@/components/ui/sidebar';
```

**用法：**
- 根布局用 `SidebarProvider`（可传 `defaultOpen`、`defaultCollapsed`）。
- 左侧：`Sidebar` → `SidebarHeader`（Logo/标题）→ `SidebarContent` → `SidebarGroup` → `SidebarMenu` → `SidebarMenuItem` + `SidebarMenuButton`（导航项），右侧边缘可放 `SidebarRail`。
- 主内容：用 `SidebarInset` 包住 header + 内容区。
- 移动端展开/折叠：在 header 里放 `SidebarTrigger`（需在 Provider 内）；在子组件中用 `useSidebar()` 得到 `collapsed`、`setOpenMobile` 等。

**示例（结构）：**
```tsx
<SidebarProvider defaultOpen defaultCollapsed={false}>
  <Sidebar>
    <SidebarHeader>...</SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton href={item.href} isActive={current === item.label} onClick={...}>
                {item.label}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
    <SidebarRail />
  </Sidebar>
  <SidebarInset>
    <header className="h-14 border-b ...">
      <SidebarTrigger aria-label="打开导航菜单" className="md:hidden" />
      ...
    </header>
    <main>{children}</main>
  </SidebarInset>
</SidebarProvider>
```

---

### 3.9 Toaster 与 toast（sonner）

**布局中挂载一次：**
```tsx
import { Toaster } from '@/components/ui/sonner';

// 在 AdminLayout 或 AdminApp 根节点
<Toaster />
```

**在任意子组件中触发提示：**
```tsx
import { toast } from 'sonner';

toast.success('保存成功');
toast.error('操作失败');
toast('普通提示');
toast.success('已标记为已处理', { description: '留言 ID: xxx' });
```

---

## 四、样式约定（Tailwind + CSS 变量）

### 4.1 主题变量（admin.css）

后台在 `admin/admin.css` 中单独引入 Tailwind 并定义变量，供组件使用：

- **亮色**：`--background`、`--foreground`、`--card`、`--primary`、`--secondary`、`--muted`、`--muted-foreground`、`--accent`、`--destructive`、`--border`、`--input`、`--ring`、`--radius` 等。
- **暗色**：`.dark` 下同名变量覆盖。

组件里通过 Tailwind 语义类引用，例如：`bg-background`、`text-foreground`、`bg-card`、`border-border`、`text-muted-foreground`、`bg-primary text-primary-foreground`、`bg-destructive`、`ring-ring` 等。

### 4.2 常用 Tailwind 用法

| 用途 | 示例 class |
|------|------------|
| 页面背景/文字 | `bg-background text-foreground` |
| 卡片/区块 | `rounded-xl shadow-sm border bg-card` |
| 次要文字 | `text-muted-foreground`、`text-xs text-muted-foreground` |
| 强调/数字 | `font-medium`、`font-semibold`、`tabular-nums` |
| 截断/单行 | `truncate`、`whitespace-nowrap` |
| 间距 | `space-y-6`、`gap-4`、`p-6`、`pt-0` |
| 表格行高亮 | `hover:bg-muted/50`、`data-[state=selected]:bg-muted` |
| 按钮与输入 | 组件已带基础样式，用 `className` 微调，如 `h-8 px-2`、`text-xs` |

### 4.3 工具函数 cn()

合并 class，避免覆盖冲突（tailwind-merge）：

```tsx
import { cn } from '@/lib/utils';

<div className={cn('base-class', isActive && 'bg-primary text-primary-foreground', className)} />
```

---

## 五、后台专用组件（非 shadcn）

| 组件 | 路径 | 用途 |
|------|------|------|
| AdminTablePage | `admin/AdminTablePage.tsx` | 通用 CRUD 表格页（拉取 Supabase 表、列名映射、外键下拉、新增/编辑/删除） |
| AdminLayout | `admin/AdminLayout.tsx` | 侧栏 + 顶栏（搜索、刷新、用户、登出）+ 主内容区 |
| MessageDrawer | `admin/MessageDrawer.tsx` | 留言详情抽屉（Sheet + 字段展示 + 标记已处理/删除） |
| ImageDropZone | `src/components/admin/ImageDropZone.tsx` | 图片拖拽上传到 Supabase Storage |

这些组件内部已大量使用上述 Button/Card/Input/Table/Badge/Sheet 等，可按需复用或拆出更小颗粒度组件。

---

## 六、在相似项目中的复用步骤

1. **复制 UI 层**：把 `src/components/ui/` 下用到的组件（button、card、input、table、badge、skeleton、sheet、sidebar、sonner）及依赖（Radix、CVA、clsx、tailwind-merge）一并拷贝或通过 shadcn 重新安装。
2. **复制样式**：将 `admin/admin.css` 的 Tailwind 与 CSS 变量（含 `.dark`）接入后台入口页面或布局。
3. **布局**：用 `SidebarProvider` + `Sidebar` + `SidebarInset` 搭好框架，主内容区按路由或 hash 渲染各 `*Page`。
4. **列表/表单**：列表用 `Card` + `Table`；表单用 `Card` + `Input` + `Button`；详情/侧栏用 `Sheet`。
5. **反馈**：根节点挂 `<Toaster />`，操作成功/失败处 `toast.success()` / `toast.error()`。
6. **加载**：数据未到时用 `Skeleton` 或简单 `animate-pulse` 占位。

按上述组件与样式用法，即可在同类后台中保持一致的视觉与交互。
