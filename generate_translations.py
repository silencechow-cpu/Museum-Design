#!/usr/bin/env python3
import json

# 为剩余18个页面生成翻译键值对
translations = {
    "zh-CN": {},
    "zh-TW": {},
    "en": {}
}

# 详情页通用翻译
details_common = {
    "zh-CN": {
        "back": "返回",
        "share": "分享",
        "loading": "加载中...",
        "notFound": "未找到",
        "backToHome": "返回首页",
        "clickToView": "点击查看大图",
        "imageCount": "第 {{current}} 张，共 {{total}} 张"
    },
    "zh-TW": {
        "back": "返回",
        "share": "分享",
        "loading": "載入中...",
        "notFound": "未找到",
        "backToHome": "返回首頁",
        "clickToView": "點擊查看大圖",
        "imageCount": "第 {{current}} 張，共 {{total}} 張"
    },
    "en": {
        "back": "Back",
        "share": "Share",
        "loading": "Loading...",
        "notFound": "Not Found",
        "backToHome": "Back to Home",
        "clickToView": "Click to view full image",
        "imageCount": "Image {{current}} of {{total}}"
    }
}

# CollectionDetail 征集详情页
collection_detail = {
    "zh-CN": {
        "title": "征集详情",
        "museum": "博物馆",
        "artifact": "文物",
        "description": "项目描述",
        "fullDescription": "详细说明",
        "requirements": "征集要求",
        "prize": "奖金",
        "prizeDetails": "奖项详情",
        "deadline": "截止日期",
        "timeRemaining": "剩余时间",
        "days": "天",
        "hours": "小时",
        "minutes": "分钟",
        "downloadMaterials": "下载素材",
        "participate": "立即参与",
        "favorite": "收藏",
        "unfavorite": "取消收藏",
        "relatedCollections": "相关征集",
        "submittedWorks": "已提交作品",
        "noWorks": "暂无作品",
        "viewAllWorks": "查看全部作品"
    },
    "zh-TW": {
        "title": "徵集詳情",
        "museum": "博物館",
        "artifact": "文物",
        "description": "項目描述",
        "fullDescription": "詳細說明",
        "requirements": "徵集要求",
        "prize": "獎金",
        "prizeDetails": "獎項詳情",
        "deadline": "截止日期",
        "timeRemaining": "剩餘時間",
        "days": "天",
        "hours": "小時",
        "minutes": "分鐘",
        "downloadMaterials": "下載素材",
        "participate": "立即參與",
        "favorite": "收藏",
        "unfavorite": "取消收藏",
        "relatedCollections": "相關徵集",
        "submittedWorks": "已提交作品",
        "noWorks": "暫無作品",
        "viewAllWorks": "查看全部作品"
    },
    "en": {
        "title": "Collection Details",
        "museum": "Museum",
        "artifact": "Artifact",
        "description": "Description",
        "fullDescription": "Full Description",
        "requirements": "Requirements",
        "prize": "Prize",
        "prizeDetails": "Prize Details",
        "deadline": "Deadline",
        "timeRemaining": "Time Remaining",
        "days": "days",
        "hours": "hours",
        "minutes": "minutes",
        "downloadMaterials": "Download Materials",
        "participate": "Participate Now",
        "favorite": "Favorite",
        "unfavorite": "Unfavorite",
        "relatedCollections": "Related Collections",
        "submittedWorks": "Submitted Works",
        "noWorks": "No works yet",
        "viewAllWorks": "View All Works"
    }
}

# WorkDetail 作品详情页
work_detail = {
    "zh-CN": {
        "title": "作品详情",
        "designer": "设计师",
        "collection": "所属征集",
        "description": "作品说明",
        "tags": "标签",
        "status": "状态",
        "statusSubmitted": "已提交",
        "statusApproved": "已通过",
        "statusRejected": "未通过",
        "statusWinner": "获奖作品",
        "rating": "评分",
        "averageRating": "平均评分",
        "ratingCount": "{{count}} 人评分",
        "rateThisWork": "为这个作品评分",
        "yourRating": "您的评分",
        "submitRating": "提交评分",
        "views": "浏览",
        "likes": "点赞",
        "createdAt": "创建时间",
        "relatedWorks": "相关作品"
    },
    "zh-TW": {
        "title": "作品詳情",
        "designer": "設計師",
        "collection": "所屬徵集",
        "description": "作品說明",
        "tags": "標籤",
        "status": "狀態",
        "statusSubmitted": "已提交",
        "statusApproved": "已通過",
        "statusRejected": "未通過",
        "statusWinner": "獲獎作品",
        "rating": "評分",
        "averageRating": "平均評分",
        "ratingCount": "{{count}} 人評分",
        "rateThisWork": "為這個作品評分",
        "yourRating": "您的評分",
        "submitRating": "提交評分",
        "views": "瀏覽",
        "likes": "點贊",
        "createdAt": "創建時間",
        "relatedWorks": "相關作品"
    },
    "en": {
        "title": "Work Details",
        "designer": "Designer",
        "collection": "Collection",
        "description": "Description",
        "tags": "Tags",
        "status": "Status",
        "statusSubmitted": "Submitted",
        "statusApproved": "Approved",
        "statusRejected": "Rejected",
        "statusWinner": "Winner",
        "rating": "Rating",
        "averageRating": "Average Rating",
        "ratingCount": "{{count}} ratings",
        "rateThisWork": "Rate this work",
        "yourRating": "Your Rating",
        "submitRating": "Submit Rating",
        "views": "Views",
        "likes": "Likes",
        "createdAt": "Created",
        "relatedWorks": "Related Works"
    }
}

# 输出JSON格式
print(json.dumps({
    "collectionDetail": collection_detail,
    "workDetail": work_detail
}, ensure_ascii=False, indent=2))
