import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import { getSession } from "@/lib/auth";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB
const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

// Vercel may add a prefix to the token name when the Blob store is connected
// (e.g. CRESTLINE_KITS_BLOB_READ_WRITE_TOKEN), so accept any *_READ_WRITE_TOKEN.
function blobToken() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN;
  const key = Object.keys(process.env).find((k) => k.endsWith("READ_WRITE_TOKEN") && process.env[k]);
  return key ? process.env[key] : undefined;
}

// Uploads a product photo.
// - With BLOB_READ_WRITE_TOKEN set: stores it in Vercel Blob (needed on the live site).
// - Without it, during local development: saves it to public/uploads on your computer.
export async function POST(req: Request) {
  const session = await getSession();
  if (session?.role !== "ADMIN") return NextResponse.json({ error: "Not allowed" }, { status: 403 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ error: "Use a JPG, PNG, WebP or AVIF image" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Images must be under 4 MB" }, { status: 400 });

  const name = `${crypto.randomUUID()}.${ext}`;

  const token = blobToken();
  if (token) {
    const blob = await put(`products/${name}`, file, { access: "public", contentType: file.type, token });
    return NextResponse.json({ url: blob.url });
  }

  if (process.env.NODE_ENV !== "production") {
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ url: `/uploads/${name}` });
  }

  return NextResponse.json(
    { error: "Photo uploads aren't set up on the live site yet. Add BLOB_READ_WRITE_TOKEN in Vercel, or paste image links instead." },
    { status: 501 },
  );
}
