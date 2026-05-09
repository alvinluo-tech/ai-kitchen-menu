import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireChef } from "@/lib/auth";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

export async function POST(request: Request) {
  try {
    const { isChef } = await requireChef();

    if (!isChef) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "请选择文件" }, { status: 400 });
    }

    // Normalize HEIC to allowed type since browser-image-compression outputs WebP
    const normalizedType =
      file.type === "image/heic" || file.type === "image/heif"
        ? "image/webp"
        : file.type;

    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_TYPES.includes(normalizedType)) {
      return NextResponse.json(
        { error: "只支持 JPG、PNG、WebP、HEIC 格式" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "图片大小不能超过 20MB" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const fileName = `${timestamp}-${random}.webp`;
    const filePath = `dishes/${fileName}`;

    const { error } = await supabase.storage
      .from("dish-images")
      .upload(filePath, file, {
        contentType: normalizedType,
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return NextResponse.json({ error: "上传失败" }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from("dish-images")
      .getPublicUrl(filePath);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}
