import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { Share2, Check, X, Link as LinkIcon } from 'lucide-react';

interface SocialAccount {
  platform: 'wechat' | 'weibo' | 'qq';
  accountId: string;
  accountName: string;
}

interface SocialAccountBindingProps {
  isOpen: boolean;
  onClose: () => void;
  currentAccounts?: SocialAccount[];
}

const platformNames = {
  wechat: '微信',
  weibo: '微博',
  qq: 'QQ',
};

const platformColors = {
  wechat: 'bg-green-500',
  weibo: 'bg-red-500',
  qq: 'bg-blue-500',
};

export default function SocialAccountBinding({ isOpen, onClose, currentAccounts = [] }: SocialAccountBindingProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<'wechat' | 'weibo' | 'qq' | null>(null);
  const [accountId, setAccountId] = useState('');
  const [accountName, setAccountName] = useState('');

  const utils = trpc.useUtils();

  const bindAccountMutation = trpc.auth.bindSocialAccount.useMutation({
    onSuccess: () => {
      toast.success('社交账号绑定成功');
      utils.auth.me.invalidate();
      handleCancelBinding();
    },
    onError: (error: { message: string }) => {
      toast.error(error.message || '绑定失败');
    },
  });

  const unbindAccountMutation = trpc.auth.unbindSocialAccount.useMutation({
    onSuccess: () => {
      toast.success('社交账号解绑成功');
      utils.auth.me.invalidate();
    },
    onError: (error: { message: string }) => {
      toast.error(error.message || '解绑失败');
    },
  });

  const handleStartBinding = (platform: 'wechat' | 'weibo' | 'qq') => {
    setSelectedPlatform(platform);
    setAccountId('');
    setAccountName('');
  };

  const handleCancelBinding = () => {
    setSelectedPlatform(null);
    setAccountId('');
    setAccountName('');
  };

  const handleConfirmBinding = () => {
    if (!selectedPlatform || !accountId || !accountName) {
      toast.error('请填写完整的账号信息');
      return;
    }

    bindAccountMutation.mutate({
      platform: selectedPlatform,
      accountId,
      accountName,
    });
  };

  const handleUnbind = (platform: 'wechat' | 'weibo' | 'qq') => {
    if (window.confirm(`确定要解绑${platformNames[platform]}账号吗？`)) {
      unbindAccountMutation.mutate({ platform });
    }
  };

  const isAccountBound = (platform: 'wechat' | 'weibo' | 'qq') => {
    return currentAccounts.some(account => account.platform === platform);
  };

  const getBoundAccount = (platform: 'wechat' | 'weibo' | 'qq') => {
    return currentAccounts.find(account => account.platform === platform);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            社交媒体账号绑定
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 微信 */}
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${platformColors.wechat} flex items-center justify-center text-white font-bold`}>
                  微
                </div>
                <div>
                  <p className="font-medium">{platformNames.wechat}</p>
                  {isAccountBound('wechat') && (
                    <p className="text-sm text-muted-foreground">
                      {getBoundAccount('wechat')?.accountName}
                    </p>
                  )}
                </div>
              </div>
              <div>
                {isAccountBound('wechat') ? (
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnbind('wechat')}
                      disabled={unbindAccountMutation.isPending}
                    >
                      解绑
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStartBinding('wechat')}
                  >
                    绑定
                  </Button>
                )}
              </div>
            </div>

            {selectedPlatform === 'wechat' && (
              <div className="space-y-2 pt-2 border-t">
                <div className="space-y-1">
                  <Label htmlFor="wechat-id">微信号</Label>
                  <Input
                    id="wechat-id"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    placeholder="请输入微信号"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="wechat-name">昵称</Label>
                  <Input
                    id="wechat-name"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="请输入微信昵称"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelBinding}
                    className="flex-1"
                  >
                    取消
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleConfirmBinding}
                    disabled={bindAccountMutation.isPending}
                    className="flex-1"
                  >
                    确认绑定
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* 微博 */}
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${platformColors.weibo} flex items-center justify-center text-white font-bold`}>
                  博
                </div>
                <div>
                  <p className="font-medium">{platformNames.weibo}</p>
                  {isAccountBound('weibo') && (
                    <p className="text-sm text-muted-foreground">
                      {getBoundAccount('weibo')?.accountName}
                    </p>
                  )}
                </div>
              </div>
              <div>
                {isAccountBound('weibo') ? (
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnbind('weibo')}
                      disabled={unbindAccountMutation.isPending}
                    >
                      解绑
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStartBinding('weibo')}
                  >
                    绑定
                  </Button>
                )}
              </div>
            </div>

            {selectedPlatform === 'weibo' && (
              <div className="space-y-2 pt-2 border-t">
                <div className="space-y-1">
                  <Label htmlFor="weibo-id">微博ID</Label>
                  <Input
                    id="weibo-id"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    placeholder="请输入微博ID"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="weibo-name">昵称</Label>
                  <Input
                    id="weibo-name"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="请输入微博昵称"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelBinding}
                    className="flex-1"
                  >
                    取消
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleConfirmBinding}
                    disabled={bindAccountMutation.isPending}
                    className="flex-1"
                  >
                    确认绑定
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* QQ */}
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${platformColors.qq} flex items-center justify-center text-white font-bold`}>
                  Q
                </div>
                <div>
                  <p className="font-medium">{platformNames.qq}</p>
                  {isAccountBound('qq') && (
                    <p className="text-sm text-muted-foreground">
                      {getBoundAccount('qq')?.accountName}
                    </p>
                  )}
                </div>
              </div>
              <div>
                {isAccountBound('qq') ? (
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnbind('qq')}
                      disabled={unbindAccountMutation.isPending}
                    >
                      解绑
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStartBinding('qq')}
                  >
                    绑定
                  </Button>
                )}
              </div>
            </div>

            {selectedPlatform === 'qq' && (
              <div className="space-y-2 pt-2 border-t">
                <div className="space-y-1">
                  <Label htmlFor="qq-id">QQ号</Label>
                  <Input
                    id="qq-id"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    placeholder="请输入QQ号"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="qq-name">昵称</Label>
                  <Input
                    id="qq-name"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="请输入QQ昵称"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelBinding}
                    className="flex-1"
                  >
                    取消
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleConfirmBinding}
                    disabled={bindAccountMutation.isPending}
                    className="flex-1"
                  >
                    确认绑定
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            <p>• 绑定社交媒体账号后，可以在平台上展示您的社交主页链接</p>
            <p>• 绑定信息仅用于展示，不会获取您的账号密码</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
