# Git Worktree 使用指南

## 简介

`git worktree` 允许你在同一个仓库中同时管理多个工作目录，每个工作目录可以处于不同的分支上。这对于需要同时开发多个功能或在多个分支之间快速切换非常有帮助。

## 基本命令

### 列出所有工作树

```bash
git worktree list
```

### 添加新的工作树

```bash
# 基于已有分支创建
git worktree add <路径> <分支名>

# 创建新分支并切换
git worktree add -b <新分支名> <路径> <基分支名>
```

### 示例

```bash
# 在根目录下创建 master 分支的工作树
git worktree add ../vue-vben-admin-master master

# 创建新分支 feature-xxx 的工作树
git worktree add -b feature-xxx ../vue-vben-admin-feature master
```

### 删除工作树

```bash
# 先移除工作树记录
git worktree remove <路径>

# 或使用 prune 清理已删除的工作目录记录
git worktree prune
```

## 适用场景

| 场景 | 说明 |
|------|------|
| 多分支并行开发 | 同时开发多个功能分支，无需频繁 stash/commit 切换 |
| 紧急修复 | 在 master 分支工作树中快速修复 bug，不影响当前开发分支 |
| 代码对比 | 在不同分支上同时打开 IDE，方便对比代码差异 |
| 构建验证 | 在不同分支独立构建，互不干扰 |

## 注意事项

1. **不能检出同一分支**: 一个分支只能在一个工作树中被检出
2. **共享 `.git` 目录**: 所有工作树共享同一个 `.git` 目录，节省磁盘空间
3. **`.gitignore` 生效**: 每个工作树都会使用相同的 `.gitignore` 配置
4. **子模块共享**: 如果项目有子模块，它们也会被共享

## 本项目推荐的工作树结构

```
vue-vben-admin/              # 主工作目录
├── vue-vben-admin-master/   # master 分支工作树
├── vue-vben-admin-feature/  # 功能分支工作树
└── vue-vben-admin-hotfix/   # 紧急修复分支工作树
```
