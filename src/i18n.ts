import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  zh: {
    translation: {
      "app": {
        "title": "Vela",
        "description": "你的个性化导航中心"
      },
      "header": {
        "adminUser": "管理员",
        "accountSettings": "账号设置",
        "about": "关于 Vela",
        "systemSettings": "系统设置",
        "importBookmarks": "导入书签",
        "logout": "退出登录",
        "switchLanguage": "切换语言",
        "keepScreenOn": "保持屏幕常亮",
        "keepScreenOff": "关闭屏幕常亮",
        "quickNotes": "速记",
        "import": {
          "empty": "文件中没有可导入的书签。",
          "saveFailed": "书签导入失败：保存到服务器时出错。",
          "readFailed": "书签导入失败：读取文件时出错。"
        }
      },
      "notes": {
        "title": "速记",
        "description": "随手记录想法，按更新时间排序。",
        "backToDashboard": "返回仪表盘",
        "searchPlaceholder": "搜索标题或内容...",
        "newNote": "新建笔记",
        "layoutToComfortable": "切换到宽松模式（显示摘要）",
        "layoutToCompact": "切换到紧凑模式（仅标题）",
        "empty": "还没有笔记",
        "emptyDescription": "点击右上角\"新建笔记\"开始记录。",
        "untitled": "无标题",
        "titlePlaceholder": "标题（可选）",
        "contentPlaceholder": "开始记录...",
        "editorEmpty": "从左侧选择一篇笔记，或新建一篇。",
        "saving": "保存中...",
        "saved": "已保存",
        "saveError": "保存失败",
        "unsaved": "有未保存的修改",
        "itemActions": "操作",
        "delete": "删除",
        "deleted": "笔记已删除",
        "deleteConfirmTitle": "删除笔记",
        "deleteConfirmDescription": "确定要删除这篇笔记吗？此操作不可撤销。",
        "loadFailed": "笔记加载失败。",
        "createFailed": "新建笔记失败。",
        "deleteFailed": "删除笔记失败。"
      },
      "common": {
        "or": "或",
        "search": "搜索"
      },
      "validation": {
        "required": "请填写必填项。",
        "email": "请输入有效的邮箱地址。",
        "passwordMin": "密码至少需要 6 个字符。",
        "passwordMismatch": "两次输入的密码不一致。",
        "inviteCode": "请输入邀请码。",
        "groupTitle": "请输入分组名称。",
        "itemTitle": "请输入导航标题。",
        "url": "请输入有效的 URL。",
        "nicknameMax": "昵称不能超过 40 个字符。",
        "avatarUrl": "请输入以 http:// 或 https:// 开头的头像 URL。",
        "inviteCount": "数量必须在 1 到 50 之间。",
        "search": "请输入搜索内容。"
      },
      "account": {
        "title": "账号设置",
        "backToDashboard": "返回仪表盘",
        "profile": {
          "title": "个人资料",
          "description": "更新你的头像和显示昵称。",
          "avatarUrl": "头像 URL",
          "avatarPlaceholder": "https://example.com/avatar.png",
          "nickname": "昵称",
          "nicknamePlaceholder": "希望如何称呼你？",
          "save": "保存资料",
          "saving": "保存中..."
        },
        "password": {
          "title": "密码",
          "description": "修改用于登录的密码。",
          "current": "当前密码",
          "new": "新密码",
          "confirm": "确认新密码",
          "update": "修改密码",
          "updating": "修改中..."
        },
        "messages": {
          "profileUpdated": "资料已更新。",
          "passwordUpdated": "密码已更新。"
        },
        "errors": {
          "profileFailed": "资料更新失败。",
          "passwordFailed": "密码修改失败。",
          "newPasswordLength": "新密码至少需要 6 个字符。",
          "passwordMismatch": "两次输入的新密码不一致。",
          "nicknameLength": "昵称不能超过 40 个字符。",
          "avatarLength": "头像 URL 不能超过 2048 个字符。",
          "avatarProtocol": "头像 URL 必须以 http:// 或 https:// 开头。",
          "passwordRequired": "请填写当前密码和新密码。",
          "currentPasswordIncorrect": "当前密码不正确。",
          "userNotFound": "用户不存在。"
        }
      },
      "auth": {
        "errors": {
          "accountDisabled": "账号已被禁用，请联系管理员。",
          "accountDeleted": "账号已被删除，无法登录。"
        }
      },
      "about": {
        "title": "关于 Vela",
        "description": "Vela 是一个面向个人使用的导航工作台，用来整理常用网站、导入浏览器书签，并在首页提供时间、天气和搜索入口。",
        "features": {
          "bookmarks": {
            "title": "书签导入",
            "description": "支持从浏览器 HTML 书签文件导入导航数据，并自动忽略内嵌 base64 图标。"
          },
          "organization": {
            "title": "导航整理",
            "description": "通过分组、排序、搜索和不同卡片尺寸管理常用链接。"
          },
          "weather": {
            "title": "时间与天气",
            "description": "首页天气支持本地缓存和手动刷新，减少重复请求。"
          },
          "admin": {
            "title": "系统管理",
            "description": "管理员可以管理用户、邀请码和系统级访问权限。"
          }
        },
        "project": {
          "title": "项目信息",
          "version": "版本",
          "frontend": "前端",
          "backend": "后端"
        },
        "storage": {
          "title": "数据存储",
          "description": "导航、用户和邀请码数据保存在本地 SQLite 数据库中，适合自托管部署。"
        }
      },
      "system": {
        "title": "系统设置",
        "description": "管理系统级资源和访问权限。",
        "backToDashboard": "返回仪表盘",
        "loading": "加载中...",
        "forbiddenTitle": "无权访问",
        "forbiddenDescription": "只有管理员可以访问系统设置。",
        "modules": {
          "users": "用户管理",
          "invites": "邀请码管理"
        },
        "roles": {
          "ADMIN": "管理员",
          "USER": "用户"
        },
        "status": {
          "ACTIVE": "正常",
          "DISABLED": "已禁用"
        },
        "pagination": {
          "summary": "第 {{page}} / {{totalPages}} 页，共 {{total}} 条",
          "previous": "上一页",
          "next": "下一页"
        },
        "users": {
          "title": "用户管理",
          "description": "查看已注册用户及其角色。",
          "email": "邮箱",
          "nickname": "昵称",
          "role": "角色",
          "status": "状态",
          "createdAt": "创建时间",
          "actions": "操作",
          "editRole": "编辑角色",
          "disable": "禁用",
          "enable": "启用",
          "delete": "删除",
          "disableTitle": "禁用用户",
          "disableDescription": "确定要禁用 {{email}} 吗？禁用后该用户无法登录。",
          "enableTitle": "启用用户",
          "enableDescription": "确定要启用 {{email}} 吗？",
          "deleteTitle": "删除用户",
          "deleteDescription": "确定要删除 {{email}} 吗？删除后该用户无法登录，此操作不可撤销。",
          "empty": "暂无用户。"
        },
        "invites": {
          "title": "邀请码管理",
          "description": "创建邀请码并查看使用状态。",
          "create": "创建邀请码",
          "createDialogTitle": "创建邀请码",
          "createDialogDescription": "选择邀请码角色和一次创建的数量。",
          "createConfirm": "确认创建",
          "creating": "创建中...",
          "count": "数量",
          "code": "邀请码",
          "role": "角色",
          "status": "状态",
          "usedBy": "使用者",
          "actions": "操作",
          "copy": "复制",
          "bulkCopy": "复制所选",
          "bulkDelete": "删除所选",
          "copied": "邀请码已复制。",
          "selectedCount": "已选择 {{count}} 个",
          "selectAll": "选择所有邀请码",
          "selectCode": "选择邀请码 {{code}}",
          "copyCode": "复制邀请码 {{code}}",
          "available": "可用",
          "used": "已使用",
          "delete": "删除",
          "deleteTitle": "删除邀请码",
          "deleteDescription": "确定要删除邀请码 {{code}} 吗？此操作不可撤销。",
          "bulkDeleteTitle": "批量删除邀请码",
          "bulkDeleteDescription": "确定要删除已选择的 {{count}} 个邀请码吗？此操作不可撤销。",
          "empty": "暂无邀请码。"
        },
        "errors": {
          "loadUsers": "用户列表加载失败。",
          "updateUser": "用户更新失败。",
          "deleteUser": "用户删除失败。",
          "loadInvites": "邀请码列表加载失败。",
          "createInvite": "邀请码创建失败。",
          "deleteInvite": "邀请码删除失败。",
          "copyInvite": "邀请码复制失败。"
        }
      },
      "weather": {
        "sunny": "晴朗",
        "local": "本地",
        "unknown": "未知",
        "useBrowserLocation": "使用浏览器定位",
        "searchCity": "输入城市...",
        "refreshWeather": "刷新天气",
        "clearSky": "晴朗",
        "cloudy": "多云",
        "fog": "雾",
        "drizzle": "毛毛雨",
        "rain": "雨",
        "snow": "雪",
        "showers": "阵雨",
        "snowShowers": "阵雪",
        "thunderstorm": "雷暴"
      },
      "search": {
        "placeholder": "使用 {{engine}} 搜索..."
      },
      "nav": {
        "myNav": "我的导航",
        "manage": "管理你的个性化快捷链接与书签。",
        "newGroup": "新建分组",
        "editGroup": "编辑分组",
        "deleteGroup": "删除分组",
        "noGroup": "还没有任何分组",
        "createFirst": "点击上方按钮创建一个新的导航分组，开始整理你的常用网址。",
        "createFirstBtn": "创建第一个分组",
        "searchPlaceholder": "搜索书签...",
        "addNav": "添加导航",
        "edit": "编辑",
        "delete": "删除",
        "groupName": "分组名称",
        "groupPlaceholder": "例如: 常用工具",
        "save": "保存",
        "cancel": "取消",
        "addNavItem": "添加快捷导航",
        "itemTitle": "标题",
        "itemTitlePlaceholder": "例如: GitHub",
        "itemUrl": "链接 (URL)",
        "itemUrlPlaceholder": "https://...",
        "itemIcon": "图标 URL (可选)",
        "itemIconPlaceholder": "图标图片地址，留空将自动获取网站图标",
        "iconHint": "提示: 保存时将自动获取该网站图标。",
        "itemDesc": "简介 (可选)",
        "itemDescPlaceholder": "简短描述..."
      },
      "defaultData": {
        "groupTitle": "导航",
        "githubTitle": "GitHub",
        "githubDesc": "代码托管与协作平台",
        "reactTitle": "React",
        "reactDesc": "构建 Web 用户界面的 JavaScript 库"
      }
    }
  },
  en: {
    translation: {
      "app": {
        "title": "Vela",
        "description": "Your personalized navigation hub"
      },
      "header": {
        "adminUser": "Admin User",
        "accountSettings": "Account Settings",
        "about": "About Vela",
        "systemSettings": "System Settings",
        "importBookmarks": "Import Bookmarks",
        "logout": "Logout",
        "switchLanguage": "Switch Language",
        "keepScreenOn": "Keep screen on",
        "keepScreenOff": "Turn off keep screen on",
        "quickNotes": "Quick notes",
        "import": {
          "empty": "No bookmarks found in the file.",
          "saveFailed": "Bookmark import failed while saving to server.",
          "readFailed": "Bookmark import failed while reading the file."
        }
      },
      "notes": {
        "title": "Quick Notes",
        "description": "Jot things down. Sorted by last edit.",
        "backToDashboard": "Back to dashboard",
        "searchPlaceholder": "Search title or content...",
        "newNote": "New note",
        "layoutToComfortable": "Switch to comfortable (show excerpt)",
        "layoutToCompact": "Switch to compact (title only)",
        "empty": "No notes yet",
        "emptyDescription": "Click \"New note\" to start writing.",
        "untitled": "Untitled",
        "titlePlaceholder": "Title (optional)",
        "contentPlaceholder": "Start writing...",
        "editorEmpty": "Select a note from the left, or create a new one.",
        "saving": "Saving...",
        "saved": "Saved",
        "saveError": "Save failed",
        "unsaved": "Unsaved changes",
        "itemActions": "Actions",
        "delete": "Delete",
        "deleted": "Note deleted",
        "deleteConfirmTitle": "Delete note",
        "deleteConfirmDescription": "Delete this note? This action cannot be undone.",
        "loadFailed": "Failed to load notes.",
        "createFailed": "Failed to create note.",
        "deleteFailed": "Failed to delete note."
      },
      "validation": {
        "required": "Please fill in the required field.",
        "email": "Enter a valid email address.",
        "passwordMin": "Password must be at least 6 characters.",
        "passwordMismatch": "Passwords do not match.",
        "inviteCode": "Enter an invite code.",
        "groupTitle": "Enter a group name.",
        "itemTitle": "Enter a link title.",
        "url": "Enter a valid URL.",
        "nicknameMax": "Nickname must be 40 characters or fewer.",
        "avatarUrl": "Enter an avatar URL starting with http:// or https://.",
        "inviteCount": "Count must be between 1 and 50.",
        "search": "Enter a search query."
      },
      "account": {
        "title": "Account Settings",
        "backToDashboard": "Back to dashboard",
        "profile": {
          "title": "Profile",
          "description": "Update your avatar and display name.",
          "avatarUrl": "Avatar URL",
          "avatarPlaceholder": "https://example.com/avatar.png",
          "nickname": "Nickname",
          "nicknamePlaceholder": "What should we call you?",
          "save": "Save Profile",
          "saving": "Saving..."
        },
        "password": {
          "title": "Password",
          "description": "Change the password used to sign in.",
          "current": "Current Password",
          "new": "New Password",
          "confirm": "Confirm New Password",
          "update": "Update Password",
          "updating": "Updating..."
        },
        "messages": {
          "profileUpdated": "Profile updated.",
          "passwordUpdated": "Password updated."
        },
        "errors": {
          "profileFailed": "Profile update failed.",
          "passwordFailed": "Password update failed.",
          "newPasswordLength": "New password must be at least 6 characters.",
          "passwordMismatch": "New passwords do not match.",
          "nicknameLength": "Nickname must be 40 characters or fewer.",
          "avatarLength": "Avatar URL must be 2048 characters or fewer.",
          "avatarProtocol": "Avatar URL must start with http:// or https://.",
          "passwordRequired": "Current password and new password are required.",
          "currentPasswordIncorrect": "Current password is incorrect.",
          "userNotFound": "User not found."
        }
      },
      "auth": {
        "errors": {
          "accountDisabled": "This account has been disabled. Contact an administrator.",
          "accountDeleted": "This account has been deleted and cannot sign in."
        }
      },
      "about": {
        "title": "About Vela",
        "description": "Vela is a personal navigation workspace for organizing frequent sites, importing browser bookmarks, and keeping time, weather, and search close at hand.",
        "features": {
          "bookmarks": {
            "title": "Bookmark Import",
            "description": "Import navigation data from browser HTML bookmark files while ignoring embedded base64 icons."
          },
          "organization": {
            "title": "Navigation Organization",
            "description": "Manage links with groups, sorting, search, and multiple card sizes."
          },
          "weather": {
            "title": "Time and Weather",
            "description": "Homepage weather uses local caching and manual refresh controls to avoid repeated requests."
          },
          "admin": {
            "title": "System Management",
            "description": "Administrators can manage users, invite codes, and system-level access."
          }
        },
        "project": {
          "title": "Project Info",
          "version": "Version",
          "frontend": "Frontend",
          "backend": "Backend"
        },
        "storage": {
          "title": "Data Storage",
          "description": "Navigation, user, and invite data are stored in a local SQLite database for self-hosted deployments."
        }
      },
      "system": {
        "title": "System Settings",
        "description": "Manage system-level resources and access.",
        "backToDashboard": "Back to dashboard",
        "loading": "Loading...",
        "forbiddenTitle": "Access denied",
        "forbiddenDescription": "Only administrators can access system settings.",
        "modules": {
          "users": "User Management",
          "invites": "Invite Codes"
        },
        "roles": {
          "ADMIN": "Admin",
          "USER": "User"
        },
        "status": {
          "ACTIVE": "Active",
          "DISABLED": "Disabled"
        },
        "pagination": {
          "summary": "Page {{page}} of {{totalPages}}, {{total}} total",
          "previous": "Previous",
          "next": "Next"
        },
        "users": {
          "title": "User Management",
          "description": "Review registered users and their roles.",
          "email": "Email",
          "nickname": "Nickname",
          "role": "Role",
          "status": "Status",
          "createdAt": "Created",
          "actions": "Actions",
          "editRole": "Edit role",
          "disable": "Disable",
          "enable": "Enable",
          "delete": "Delete",
          "disableTitle": "Disable user",
          "disableDescription": "Disable {{email}}? This user will no longer be able to sign in.",
          "enableTitle": "Enable user",
          "enableDescription": "Enable {{email}}?",
          "deleteTitle": "Delete user",
          "deleteDescription": "Delete {{email}}? This user will no longer be able to sign in. This action cannot be undone.",
          "empty": "No users yet."
        },
        "invites": {
          "title": "Invite Code Management",
          "description": "Create invite codes and review usage status.",
          "create": "Create Invite",
          "createDialogTitle": "Create Invite Codes",
          "createDialogDescription": "Choose a role and how many invite codes to create.",
          "createConfirm": "Create",
          "creating": "Creating...",
          "count": "Count",
          "code": "Code",
          "role": "Role",
          "status": "Status",
          "usedBy": "Used By",
          "actions": "Actions",
          "copy": "Copy",
          "bulkCopy": "Copy Selected",
          "bulkDelete": "Delete Selected",
          "copied": "Invite code copied.",
          "selectedCount": "{{count}} selected",
          "selectAll": "Select all invite codes",
          "selectCode": "Select invite code {{code}}",
          "copyCode": "Copy invite code {{code}}",
          "available": "Available",
          "used": "Used",
          "delete": "Delete",
          "deleteTitle": "Delete invite code",
          "deleteDescription": "Delete invite code {{code}}? This action cannot be undone.",
          "bulkDeleteTitle": "Delete invite codes",
          "bulkDeleteDescription": "Delete {{count}} selected invite codes? This action cannot be undone.",
          "empty": "No invite codes yet."
        },
        "errors": {
          "loadUsers": "Failed to load users.",
          "updateUser": "Failed to update user.",
          "deleteUser": "Failed to delete user.",
          "loadInvites": "Failed to load invite codes.",
          "createInvite": "Failed to create invite code.",
          "deleteInvite": "Failed to delete invite code.",
          "copyInvite": "Failed to copy invite code."
        }
      },
      "common": {
        "or": "or",
        "search": "Search"
      },
      "weather": {
        "sunny": "Sunny",
        "local": "Local",
        "unknown": "Unknown",
        "useBrowserLocation": "Browser Location",
        "searchCity": "Enter city...",
        "refreshWeather": "Refresh weather",
        "clearSky": "Clear sky",
        "cloudy": "Cloudy",
        "fog": "Fog",
        "drizzle": "Drizzle",
        "rain": "Rain",
        "snow": "Snow",
        "showers": "Showers",
        "snowShowers": "Snow showers",
        "thunderstorm": "Thunderstorm"
      },
      "search": {
        "placeholder": "Search with {{engine}}..."
      },
      "nav": {
        "myNav": "My Navigation",
        "manage": "Manage your personalized quick links and bookmarks.",
        "newGroup": "New Group",
        "editGroup": "Edit Group",
        "deleteGroup": "Delete Group",
        "noGroup": "No groups yet",
        "createFirst": "Click the button above to create a new navigation group and organize your links.",
        "createFirstBtn": "Create First Group",
        "searchPlaceholder": "Search bookmarks...",
        "addNav": "Add Link",
        "edit": "Edit",
        "delete": "Delete",
        "groupName": "Group Name",
        "groupPlaceholder": "e.g., Development Tools",
        "save": "Save",
        "cancel": "Cancel",
        "addNavItem": "Add Shortcut",
        "itemTitle": "Title",
        "itemTitlePlaceholder": "e.g., GitHub",
        "itemUrl": "Link (URL)",
        "itemUrlPlaceholder": "https://...",
        "itemIcon": "Icon URL (Optional)",
        "itemIconPlaceholder": "Leave blank to auto-fetch icon",
        "iconHint": "Hint: Icon will be automatically fetched on save.",
        "itemDesc": "Description (Optional)",
        "itemDescPlaceholder": "Short description..."
      },
      "defaultData": {
        "groupTitle": "Navigation",
        "githubTitle": "GitHub",
        "githubDesc": "Code hosting and collaboration platform",
        "reactTitle": "React",
        "reactDesc": "A JavaScript library for building user interfaces"
      }
    }
  }
};

const savedLanguage = localStorage.getItem('vela_language') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
