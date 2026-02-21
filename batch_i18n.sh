#!/bin/bash
# 批量为页面添加i18next导入和使用

for file in client/src/pages/DesignerDetail.tsx client/src/pages/CollectionList.tsx client/src/pages/WorkList.tsx; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    # 检查是否已经导入了useTranslation
    if ! grep -q "useTranslation" "$file"; then
      # 在第一个import后添加i18next导入
      sed -i "1a import { useTranslation } from 'react-i18next';" "$file"
      echo "  - Added useTranslation import"
    fi
  fi
done

echo "✅ Batch processing complete"
