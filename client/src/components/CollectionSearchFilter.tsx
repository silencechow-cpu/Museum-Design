/**
 * 征集项目搜索和筛选组件
 */

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface CollectionSearchFilterProps {
  onSearch: (filters: SearchFilters) => void;
}

export interface SearchFilters {
  keyword?: string;
  museumId?: number;
  minPrize?: number;
  maxPrize?: number;
  deadlineStart?: Date;
  deadlineEnd?: Date;
  status?: "draft" | "active" | "closed" | "completed";
}

export default function CollectionSearchFilter({ onSearch }: CollectionSearchFilterProps) {
  const [keyword, setKeyword] = useState('');
  const [museumId, setMuseumId] = useState<string>('');
  const [prizeRange, setPrizeRange] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // 获取所有博物馆列表
  const { data: museums } = trpc.museum.list.useQuery();

  const handleSearch = () => {
    const filters: SearchFilters = {};

    if (keyword.trim()) {
      filters.keyword = keyword.trim();
    }

    if (museumId && museumId !== 'all') {
      filters.museumId = parseInt(museumId);
    }

    if (prizeRange && prizeRange !== 'all') {
      const [min, max] = prizeRange.split('-').map(v => parseInt(v));
      if (min !== undefined) filters.minPrize = min;
      if (max !== undefined) filters.maxPrize = max;
    }

    // 只显示active状态的征集
    filters.status = 'active';

    onSearch(filters);
  };

  const handleReset = () => {
    setKeyword('');
    setMuseumId('all');
    setPrizeRange('all');
    onSearch({ status: 'active' });
  };

  // 获取已选筛选条件
  const getActiveFilters = () => {
    const filters: Array<{ key: string; label: string }> = [];
    
    if (keyword.trim()) {
      filters.push({ key: 'keyword', label: `关键词: ${keyword}` });
    }
    
    if (museumId && museumId !== 'all') {
      const museum = museums?.find(m => m.id.toString() === museumId);
      if (museum) {
        filters.push({ key: 'museum', label: `博物馆: ${museum.name}` });
      }
    }
    
    if (prizeRange && prizeRange !== 'all') {
      const prizeLabels: Record<string, string> = {
        '0-10000': '￥0 - ￥10,000',
        '10000-30000': '￥10,000 - ￥30,000',
        '30000-50000': '￥30,000 - ￥50,000',
        '50000-100000': '￥50,000 - ￥100,000',
        '100000-999999999': '￥100,000+'
      };
      filters.push({ key: 'prize', label: `奖金: ${prizeLabels[prizeRange]}` });
    }
    
    return filters;
  };

  // 移除单个筛选条件
  const handleRemoveFilter = (key: string) => {
    if (key === 'keyword') {
      setKeyword('');
    } else if (key === 'museum') {
      setMuseumId('all');
    } else if (key === 'prize') {
      setPrizeRange('all');
    }
    
    // 重新搜索
    setTimeout(() => {
      handleSearch();
    }, 0);
  };

  const activeFilters = getActiveFilters();

  return (
    <div className="mb-8 space-y-4">
      {/* 搜索和筛选栏 - 一行布局 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="搜索征集项目、文物名称..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} className="bg-[#C8102E] hover:bg-[#A00D24]">
                搜索
              </Button>
            </div>
          </div>

          {/* 博物馆筛选 */}
          <div className="w-full md:w-[200px]">
            <Select value={museumId} onValueChange={setMuseumId}>
              <SelectTrigger>
                <SelectValue placeholder="选择博物馆" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部博物馆</SelectItem>
                {museums?.map((museum) => (
                  <SelectItem key={museum.id} value={museum.id.toString()}>
                    {museum.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 奖金范围筛选 */}
          <div className="w-full md:w-[200px]">
            <Select value={prizeRange} onValueChange={setPrizeRange}>
              <SelectTrigger>
                <SelectValue placeholder="选择奖金范围" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部奖金</SelectItem>
                <SelectItem value="0-10000">￥0 - ￥10,000</SelectItem>
                <SelectItem value="10000-30000">￥10,000 - ￥30,000</SelectItem>
                <SelectItem value="30000-50000">￥30,000 - ￥50,000</SelectItem>
                <SelectItem value="50000-100000">￥50,000 - ￥100,000</SelectItem>
                <SelectItem value="100000-999999999">￥100,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 已选筛选条件标签 */}
        {activeFilters.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">已选条件：</span>
            {activeFilters.map(filter => (
              <Badge 
                key={filter.key} 
                variant="secondary" 
                className="gap-1 px-3 py-1 cursor-pointer hover:bg-secondary/80"
                onClick={() => handleRemoveFilter(filter.key)}
              >
                {filter.label}
                <X className="w-3 h-3" />
              </Badge>
            ))}
            <Button onClick={handleReset} variant="ghost" size="sm" className="h-7">
              清除全部
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
