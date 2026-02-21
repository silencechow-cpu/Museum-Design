import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

interface WelcomeDialogProps {
  userName: string;
  userRole: 'museum' | 'designer' | 'admin' | 'user';
}

export function WelcomeDialog({ userName, userRole }: WelcomeDialogProps) {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // 检查是否已经显示过欢迎对话框
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setOpen(false);
  };

  const handleGoToProfile = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setOpen(false);
    setLocation('/profile');
  };

  const getRoleText = () => {
    switch (userRole) {
      case 'museum':
        return '博物馆';
      case 'designer':
        return '设计师';
      case 'admin':
        return '管理员';
      default:
        return '用户';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">欢迎来到古韵新创！</DialogTitle>
          <DialogDescription className="text-base mt-4">
            {userName ? `你好，${userName}！` : '你好！'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            您已成功注册为<span className="font-semibold text-foreground">{getRoleText()}</span>账号。
          </p>
          <p className="text-sm text-muted-foreground">
            {userRole === 'museum' && '您可以发布征集项目，查看设计师提交的作品，并对作品进行评分。'}
            {userRole === 'designer' && '您可以浏览征集项目，提交作品参与征集，并查看您的作品评分。'}
            {userRole === 'admin' && '您拥有管理员权限，可以管理平台的所有内容。'}
            {userRole === 'user' && '您可以浏览征集项目和作品，收藏感兴趣的内容。'}
          </p>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">快速开始：</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              {userRole === 'museum' && (
                <>
                  <li>完善博物馆资料</li>
                  <li>发布第一个征集项目</li>
                  <li>查看设计师提交的作品</li>
                </>
              )}
              {userRole === 'designer' && (
                <>
                  <li>完善个人资料</li>
                  <li>浏览热门征集项目</li>
                  <li>提交您的第一个作品</li>
                </>
              )}
            </ul>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={handleClose}>
            稍后再说
          </Button>
          <Button onClick={handleGoToProfile}>
            完善资料
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
