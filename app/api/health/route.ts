import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ ok: true, scheduler: process.env.ENABLE_SCHEDULER === "1" });
}
