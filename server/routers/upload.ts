import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { storagePut } from "../storage";
import { TRPCError } from "@trpc/server";

export const uploadRouter = router({
  // 上传图片到S3
  uploadImage: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileData: z.string(), // Base64编码的文件数据
        contentType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // 解码Base64数据
        const buffer = Buffer.from(input.fileData, 'base64');

        // 生成文件key（添加随机后缀防止枚举）
        const randomSuffix = Math.random().toString(36).substring(2, 15);
        const fileKey = `works/${ctx.user.id}/${Date.now()}-${randomSuffix}-${input.fileName}`;

        // 上传到S3
        const { url } = await storagePut(fileKey, buffer, input.contentType);

        return { url, key: fileKey };
      } catch (error) {
        console.error('图片上传失败:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '图片上传失败',
        });
      }
    }),

  // 批量上传图片
  uploadMultipleImages: protectedProcedure
    .input(
      z.object({
        files: z.array(
          z.object({
            fileName: z.string(),
            fileData: z.string(),
            contentType: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const results: { url: string; key: string }[] = [];

      for (const file of input.files) {
        try {
          const buffer = Buffer.from(file.fileData, 'base64');
          const randomSuffix = Math.random().toString(36).substring(2, 15);
          const fileKey = `works/${ctx.user.id}/${Date.now()}-${randomSuffix}-${file.fileName}`;

          const { url } = await storagePut(fileKey, buffer, file.contentType);
          results.push({ url, key: fileKey });
        } catch (error) {
          console.error(`文件 ${file.fileName} 上传失败:`, error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `文件 ${file.fileName} 上传失败`,
          });
        }
      }

      return results;
    }),
});
