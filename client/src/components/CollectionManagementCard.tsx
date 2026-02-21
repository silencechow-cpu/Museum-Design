import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Play, Pause, XCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface Collection {
  id: number;
  title: string;
  description: string | null;
  prize: string | null;
  deadline: Date;
  status: "draft" | "active" | "closed" | "completed";
}

interface CollectionManagementCardProps {
  collection: Collection;
  onStatusChange: () => void;
  onNavigate: () => void;
}

const statusConfig = {
  draft: { label: "草稿", color: "bg-gray-100 text-gray-700" },
  active: { label: "征集中", color: "bg-green-100 text-green-700" },
  closed: { label: "已暂停", color: "bg-yellow-100 text-yellow-700" },
  completed: { label: "已结束", color: "bg-blue-100 text-blue-700" },
};

export default function CollectionManagementCard({
  collection,
  onStatusChange,
  onNavigate,
}: CollectionManagementCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const updateStatusMutation = trpc.collection.updateStatus.useMutation();

  const handleStatusChange = async (newStatus: "draft" | "active" | "closed" | "completed") => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      await updateStatusMutation.mutateAsync({
        collectionId: collection.id,
        status: newStatus,
      });
      toast.success("状态更新成功");
      onStatusChange();
    } catch (error: any) {
      toast.error(error.message || "状态更新失败");
    } finally {
      setIsUpdating(false);
    }
  };

  const getAvailableActions = () => {
    const actions = [];
    
    if (collection.status === "draft") {
      actions.push({
        label: "开始征集",
        icon: Play,
        status: "active" as const,
      });
    }
    
    if (collection.status === "active") {
      actions.push({
        label: "暂停征集",
        icon: Pause,
        status: "closed" as const,
      });
      actions.push({
        label: "结束征集",
        icon: CheckCircle,
        status: "completed" as const,
      });
    }
    
    if (collection.status === "closed") {
      actions.push({
        label: "继续征集",
        icon: Play,
        status: "active" as const,
      });
      actions.push({
        label: "结束征集",
        icon: CheckCircle,
        status: "completed" as const,
      });
    }

    return actions;
  };

  const availableActions = getAvailableActions();

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 cursor-pointer" onClick={onNavigate}>
          <h3 className="font-semibold text-lg mb-2">{collection.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {collection.description}
          </p>
          <div className="flex gap-4 text-sm">
            <span className="text-[#C8102E]">奖金：¥{collection.prize}</span>
            <span className="text-muted-foreground">
              截止：{new Date(collection.deadline).toLocaleDateString("zh-CN")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${statusConfig[collection.status].color}`}>
            {statusConfig[collection.status].label}
          </span>

          {availableActions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={isUpdating}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {availableActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <DropdownMenuItem
                      key={action.status}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(action.status);
                      }}
                      disabled={isUpdating}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {action.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}
