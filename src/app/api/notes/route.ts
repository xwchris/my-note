import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data/notes.json");

// 确保数据目录存在
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

// 如果文件不存在，创建空的笔记文件
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ notes: [] }));
}

export async function GET() {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json({ error: "获取笔记失败" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const currentData = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    currentData.notes.push({ ...data, id: Date.now().toString() });
    fs.writeFileSync(DATA_FILE, JSON.stringify(currentData, null, 2));
    return NextResponse.json(currentData);
  } catch (error) {
    return NextResponse.json({ error: "创建笔记失败" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const currentData = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    const index = currentData.notes.findIndex(
      (note: any) => note.id === data.id
    );
    if (index !== -1) {
      currentData.notes[index] = data;
      fs.writeFileSync(DATA_FILE, JSON.stringify(currentData, null, 2));
      return NextResponse.json(currentData);
    }
    return NextResponse.json({ error: "笔记不存在" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: "更新笔记失败" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "缺少笔记ID" }, { status: 400 });
    }

    const currentData = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    currentData.notes = currentData.notes.filter((note: any) => note.id !== id);
    fs.writeFileSync(DATA_FILE, JSON.stringify(currentData, null, 2));
    return NextResponse.json(currentData);
  } catch (error) {
    return NextResponse.json({ error: "删除笔记失败" }, { status: 500 });
  }
}
