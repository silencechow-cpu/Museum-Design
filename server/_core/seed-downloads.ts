/**
 * 更新征集项目资料下载数据
 * 为所有征集项目补充示例下载文件列表（JSON格式存储在downloadUrl字段）
 */
import { Router } from "express";
import mysql from "mysql2/promise";

export function registerSeedDownloadsRoute(app: Router) {
  app.post("/api/seed-downloads", async (req, res) => {
    const secret = req.headers["x-seed-secret"] || req.query.secret;
    const expectedSecret = process.env.SEED_SECRET || "museum-seed-2024";
    if (secret !== expectedSecret) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      return res.status(500).json({ error: "DATABASE_URL not set" });
    }
    const logs: string[] = [];
    const log = (msg: string) => { console.log(msg); logs.push(msg); };
    let connection: mysql.Connection | null = null;
    try {
      const url = new URL(DATABASE_URL);
      connection = await mysql.createConnection({
        host: url.hostname,
        port: parseInt(url.port) || 3306,
        user: url.username,
        password: url.password,
        database: url.pathname.slice(1),
      });

      log("📥 开始更新征集项目资料下载数据...");

      // 为每个征集项目定义下载资料列表（JSON格式）
      // 格式：[{name, size, type, url}]
      const downloadDataMap: Record<string, string> = {
        "南朝砖画·竹林七贤与荣启期": JSON.stringify([
          { name: "竹林七贤砖画高清素材包.zip", size: "128MB", type: "zip", url: "#" },
          { name: "征集要求详细说明.pdf", size: "2.4MB", type: "pdf", url: "#" },
          { name: "参考设计案例集.pdf", size: "18MB", type: "pdf", url: "#" },
        ]),
        "越窑秘色瓷八棱净瓶": JSON.stringify([
          { name: "越窑青瓷文物高清图集.zip", size: "95MB", type: "zip", url: "#" },
          { name: "征集要求详细说明.pdf", size: "1.8MB", type: "pdf", url: "#" },
          { name: "秘色瓷釉色参考手册.pdf", size: "12MB", type: "pdf", url: "#" },
        ]),
        "马王堆汉墓T形帛画": JSON.stringify([
          { name: "马王堆文物高清素材包.zip", size: "210MB", type: "zip", url: "#" },
          { name: "征集要求详细说明.pdf", size: "3.1MB", type: "pdf", url: "#" },
          { name: "汉代纹样设计参考.pdf", size: "22MB", type: "pdf", url: "#" },
          { name: "往届优秀作品集.pdf", size: "35MB", type: "pdf", url: "#" },
        ]),
        "三星堆青铜纵目面具": JSON.stringify([
          { name: "三星堆文物高清图集.zip", size: "185MB", type: "zip", url: "#" },
          { name: "征集要求详细说明.pdf", size: "2.7MB", type: "pdf", url: "#" },
          { name: "古蜀文明文化背景资料.pdf", size: "15MB", type: "pdf", url: "#" },
        ]),
        "清代御题端砚": JSON.stringify([
          { name: "端砚文物高清素材包.zip", size: "76MB", type: "zip", url: "#" },
          { name: "征集要求详细说明.pdf", size: "1.5MB", type: "pdf", url: "#" },
          { name: "岭南文房文化介绍.pdf", size: "8MB", type: "pdf", url: "#" },
        ]),
        "明代妆花缎龙袍料": JSON.stringify([
          { name: "云锦纹样高清素材包.zip", size: "156MB", type: "zip", url: "#" },
          { name: "征集要求详细说明.pdf", size: "2.2MB", type: "pdf", url: "#" },
          { name: "云锦织造工艺介绍.pdf", size: "20MB", type: "pdf", url: "#" },
          { name: "明代服饰纹样参考集.pdf", size: "28MB", type: "pdf", url: "#" },
        ]),
        "清代龙纹青花瓷": JSON.stringify([
          { name: "龙纹青花瓷高清图集.zip", size: "110MB", type: "zip", url: "#" },
          { name: "征集要求详细说明.pdf", size: "2.0MB", type: "pdf", url: "#" },
          { name: "青花瓷纹样设计参考.pdf", size: "16MB", type: "pdf", url: "#" },
        ]),
        "清明上河图": JSON.stringify([
          { name: "清明上河图高清全卷素材.zip", size: "320MB", type: "zip", url: "#" },
          { name: "征集要求详细说明.pdf", size: "3.5MB", type: "pdf", url: "#" },
          { name: "宋代市井文化背景资料.pdf", size: "18MB", type: "pdf", url: "#" },
          { name: "往届优秀作品集.pdf", size: "42MB", type: "pdf", url: "#" },
        ]),
        "后母戊鼎": JSON.stringify([
          { name: "后母戊鼎高清素材包.zip", size: "88MB", type: "zip", url: "#" },
          { name: "征集要求详细说明.pdf", size: "2.3MB", type: "pdf", url: "#" },
          { name: "商代青铜文化介绍.pdf", size: "14MB", type: "pdf", url: "#" },
        ]),
        "良渚玉琮": JSON.stringify([
          { name: "良渚玉器高清图集.zip", size: "92MB", type: "zip", url: "#" },
          { name: "征集要求详细说明.pdf", size: "1.9MB", type: "pdf", url: "#" },
          { name: "良渚文化背景资料.pdf", size: "11MB", type: "pdf", url: "#" },
        ]),
        "苏州拙政园": JSON.stringify([
          { name: "拙政园四季实景素材包.zip", size: "245MB", type: "zip", url: "#" },
          { name: "征集要求详细说明.pdf", size: "2.8MB", type: "pdf", url: "#" },
          { name: "苏州园林美学参考手册.pdf", size: "25MB", type: "pdf", url: "#" },
          { name: "江南园林纹样设计参考.pdf", size: "19MB", type: "pdf", url: "#" },
        ]),
        "唐三彩骆驼载乐俑": JSON.stringify([
          { name: "唐三彩文物高清图集.zip", size: "134MB", type: "zip", url: "#" },
          { name: "征集要求详细说明.pdf", size: "2.1MB", type: "pdf", url: "#" },
          { name: "盛唐文化背景资料.pdf", size: "17MB", type: "pdf", url: "#" },
        ]),
      };

      // 获取所有征集项目
      const [collections] = await connection.execute(
        "SELECT id, artifactName FROM collections"
      ) as any;

      let updatedCount = 0;
      for (const collection of collections) {
        const downloadData = downloadDataMap[collection.artifactName];
        if (downloadData) {
          await connection.execute(
            "UPDATE collections SET downloadUrl = ? WHERE id = ?",
            [downloadData, collection.id]
          );
          log(`  ✓ 更新资料下载: ${collection.artifactName} (id=${collection.id})`);
          updatedCount++;
        } else {
          log(`  ⚠ 未找到匹配数据: ${collection.artifactName} (id=${collection.id})`);
        }
      }

      log(`\n✅ 资料下载数据更新完成！共更新 ${updatedCount} 个征集项目`);
      return res.json({ success: true, logs });
    } catch (err: any) {
      log(`❌ 错误: ${err.message}`);
      return res.status(500).json({ success: false, error: err.message, logs });
    } finally {
      if (connection) await connection.end();
    }
  });
}
