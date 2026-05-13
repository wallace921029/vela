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
        "logout": "退出登录",
        "switchLanguage": "切换语言"
      },
      "weather": {
        "sunny": "晴朗",
        "local": "本地"
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
        "searchPlaceholder": "搜索工具...",
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
        "logout": "Logout",
        "switchLanguage": "Switch Language"
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
        "searchPlaceholder": "Search tools...",
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
