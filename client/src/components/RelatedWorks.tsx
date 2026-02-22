import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Loader2 } from "lucide-react";

interface RelatedWorksProps {
  workId: number;
  limit?: number;
}

export default function RelatedWorks({ workId, limit = 6 }: RelatedWorksProps) {
  const { data: relatedWorks, isLoading } = trpc.work.getRelated.useQuery({
    workId,
    limit,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#8B4513]" />
      </div>
    );
  }

  if (!relatedWorks || relatedWorks.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-[#f5f1e8]">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-12 text-[#8B4513]">
          相关作品推荐
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {relatedWorks.map((work) => {
            // 解析图片
            let images: string[] = [];
            try {
              images = work.images ? JSON.parse(work.images) : [];
            } catch (e) {
              images = [];
            }
            const coverImage = images[0] || "/placeholder-work.jpg";

            // 解析标签
            let tags: string[] = [];
            try {
              tags = work.tags && work.tags !== 'null' ? JSON.parse(work.tags) : [];
            } catch (e) {
              tags = [];
            }

            // 状态标签
            const statusLabels: Record<string, { text: string; color: string }> = {
              submitted: { text: "待审核", color: "bg-yellow-500" },
              approved: { text: "已通过", color: "bg-green-500" },
              rejected: { text: "未通过", color: "bg-red-500" },
              awarded: { text: "获奖作品", color: "bg-purple-500" },
            };
            const statusLabel = statusLabels[work.status] || { text: work.status, color: "bg-gray-500" };

            return (
              <Link key={work.id} href={`/work/${work.id}`}>
                <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group">
                  {/* 作品封面 */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={coverImage}
                      alt={work.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                    />
                    {/* 状态标签 */}
                    <div className={`absolute top-4 right-4 ${statusLabel.color} text-white px-3 py-1 rounded-full text-sm font-medium`}>
                      {statusLabel.text}
                    </div>
                  </div>

                  {/* 作品信息 */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-[#8B4513] line-clamp-1 group-hover:text-[#A0522D] transition-colors">
                      {work.title}
                    </h3>
                    
                    {work.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {work.description}
                      </p>
                    )}

                    {/* 标签 */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-[#f5f1e8] text-[#8B4513] text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {tags.length > 3 && (
                          <span className="px-2 py-1 bg-[#f5f1e8] text-[#8B4513] text-xs rounded-full">
                            +{tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
