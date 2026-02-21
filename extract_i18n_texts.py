#!/usr/bin/env python3
import re
import json
from pathlib import Path

# 待处理的页面列表
pages = [
    # 详情页
    "client/src/pages/CollectionDetail.tsx",
    "client/src/pages/WorkDetail.tsx",
    "client/src/pages/MuseumDetail.tsx",
    "client/src/pages/DesignerDetail.tsx",
    # 列表页
    "client/src/pages/CollectionList.tsx",
    "client/src/pages/WorkList.tsx",
    "client/src/pages/MuseumList.tsx",
    "client/src/pages/DesignerList.tsx",
    # 个人中心
    "client/src/pages/Profile.tsx",
    "client/src/pages/MyWorks.tsx",
    "client/src/pages/MyCollections.tsx",
    # 表单页面
    "client/src/pages/RegistrationGuide.tsx",
    "client/src/pages/WelcomeDialog.tsx",
    "client/src/pages/WorkSubmitForm.tsx",
    "client/src/pages/CollectionEditPage.tsx",
    # 其他页面
    "client/src/pages/LoginPage.tsx",
    "client/src/pages/NotFound.tsx",
]

def extract_chinese_texts(file_path):
    """提取文件中的中文文本"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 匹配中文字符串（包括引号内的中文）
        chinese_pattern = r'["\']([^"\']*[\u4e00-\u9fa5]+[^"\']*)["\']'
        matches = re.findall(chinese_pattern, content)
        
        # 去重并过滤
        unique_texts = []
        seen = set()
        for text in matches:
            # 跳过纯数字、纯符号、空字符串
            if text and text not in seen and re.search(r'[\u4e00-\u9fa5]', text):
                unique_texts.append(text)
                seen.add(text)
        
        return unique_texts
    except FileNotFoundError:
        return []

# 提取所有页面的文本
results = {}
for page_path in pages:
    page_name = Path(page_path).stem
    texts = extract_chinese_texts(page_path)
    if texts:
        results[page_name] = texts
        print(f"\n【{page_name}】 - 找到 {len(texts)} 个中文文本")
        for i, text in enumerate(texts[:5], 1):  # 只显示前5个
            print(f"  {i}. {text[:50]}...")
        if len(texts) > 5:
            print(f"  ... 还有 {len(texts) - 5} 个")

# 保存结果
output_file = "i18n_texts_extracted.json"
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print(f"\n✅ 提取完成！结果已保存到 {output_file}")
print(f"总计处理 {len(results)} 个页面")
