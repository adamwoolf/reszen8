// migrateContentful.js
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
// import dotenv from "dotenv";
import * as contentful from "contentful";
import * as dotenv from "dotenv";
dotenv.config();
const client = contentful.createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
});

dotenv.config();

// --- AWS Setup ---
const s3 = new S3Client({ region: process.env.AWS_REGION });
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// --- Utility to download audio ---
async function downloadFile(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

// --- Main Migration ---
async function migrate() {
  try {
    console.log("Fetching entries from Contentful...");
    const entries = await client.getEntries({ content_type: process.env.CONTENTFUL_CONTENT_TYPE });

    for (const entry of entries.items) {
      console.log(entry);
      const title = entry.fields.title || "Untitled";
      const text = entry.fields.body || "";
      const audioUrl = entry.fields.audioFile?.fields?.file?.url; // Contentful asset URL

      console.log(`Processing: ${title}`);

      let s3Url = null;
      if (audioUrl) {
        const fileBuffer = await downloadFile(`https:${audioUrl}`);
        const fileName = `meditations/${title.replace(/\s+/g, "_")}_${Date.now()}.mp3`;

        await s3.send(
          new PutObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: fileName,
            Body: fileBuffer,
            ContentType: "audio/mpeg",
          })
        );

        s3Url = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

        // console.log(s3Url);
      }

      // DynamoDB entry
      const dbItem = {
        uid: entry.sys.id, // unique ID from Contentful
        title,
        content: text,
        audioUrl: s3Url,
        createdAt: new Date().toISOString(),
      };

      // console.log(dbItem);

      await ddb.send(
        new PutCommand({
          TableName: process.env.DATABASE_TABLE,
          Item: dbItem,
        })
      );

      console.log(`Migrated: ${title}`);
    }

    console.log("Migration complete!");
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

migrate();
