/**
 * 作品分享组件
 * 支持复制链接、生成二维码、分享到社交媒体
 */

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Share2, Copy, QrCode, Check } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';

interface ShareButtonProps {
  title: string;
  description?: string;
  url?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export default function ShareButton({ 
  title, 
  description, 
  url,
  variant = 'outline',
  size = 'default'
}: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  
  // 使用当前页面URL或传入的URL
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = description || title;

  // 生成二维码
  useEffect(() => {
    if (open && shareUrl) {
      QRCode.toDataURL(shareUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
        .then((url) => {
          setQrCodeUrl(url);
        })
        .catch((err) => {
          console.error('生成二维码失败:', err);
        });
    }
  }, [open, shareUrl]);

  // 复制链接
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('链接已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('复制失败，请手动复制');
    }
  };

  // 下载二维码
  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.download = `${title}-二维码.png`;
    link.href = qrCodeUrl;
    link.click();
    toast.success('二维码已下载');
  };

  // 分享到微博
  const shareToWeibo = () => {
    const weiboUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`;
    window.open(weiboUrl, '_blank', 'width=600,height=400');
  };

  // 分享到QQ空间
  const shareToQzone = () => {
    const qzoneUrl = `https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(shareText)}`;
    window.open(qzoneUrl, '_blank', 'width=600,height=400');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          <Share2 className="w-4 h-4 mr-2" />
          分享
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>分享作品</DialogTitle>
          <DialogDescription>
            选择分享方式，让更多人看到这个作品
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 复制链接 */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-3 py-2 text-sm border rounded-md bg-gray-50"
            />
            <Button
              onClick={copyLink}
              variant="outline"
              size="sm"
              className="flex-shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  复制
                </>
              )}
            </Button>
          </div>

          {/* 二维码 */}
          {qrCodeUrl && (
            <div className="flex flex-col items-center gap-3 p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 text-sm font-medium">
                <QrCode className="w-4 h-4" />
                扫描二维码分享
              </div>
              <img 
                src={qrCodeUrl} 
                alt="分享二维码" 
                className="w-48 h-48 border-4 border-white rounded-lg shadow-sm"
              />
              <Button
                onClick={downloadQRCode}
                variant="outline"
                size="sm"
              >
                下载二维码
              </Button>
            </div>
          )}

          {/* 社交媒体分享 */}
          <div className="space-y-2">
            <div className="text-sm font-medium">分享到社交媒体</div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={shareToWeibo}
                variant="outline"
                className="w-full"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.194 14.197c.207-.832.207-1.539 0-2.121-.104-.291-.311-.519-.622-.685.207-.873.207-1.663 0-2.371-.207-.708-.622-1.25-1.245-1.622-.622-.373-1.452-.559-2.49-.559h-4.98c.104-.582.156-1.08.156-1.497 0-.831-.207-1.497-.622-1.996-.415-.498-1.037-.748-1.867-.748-.622 0-1.141.208-1.556.623-.415.415-.622.915-.622 1.497v.374c0 .582-.104 1.205-.311 1.87-.208.666-.519 1.29-.934 1.871-.415.582-.934 1.08-1.556 1.497-.622.415-1.348.623-2.179.623H2v8h.622c.622 0 1.245.104 1.867.311.622.208 1.141.499 1.556.873.415.373.726.831.934 1.372.207.54.311 1.163.311 1.87v.374c0 .582.207 1.08.622 1.497.415.415.934.623 1.556.623.83 0 1.452-.25 1.867-.748.415-.499.622-1.165.622-1.996 0-.416-.052-.915-.156-1.497h4.98c1.038 0 1.868-.186 2.49-.559.623-.373 1.038-.914 1.245-1.622.207-.708.207-1.498 0-2.371.311-.166.518-.394.622-.685z"/>
                </svg>
                微博
              </Button>
              <Button
                onClick={shareToQzone}
                variant="outline"
                className="w-full"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                </svg>
                QQ空间
              </Button>
            </div>
          </div>

          {/* 微信提示 */}
          <div className="text-xs text-muted-foreground text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
            💡 微信分享：请使用微信扫描二维码或复制链接到微信发送
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
