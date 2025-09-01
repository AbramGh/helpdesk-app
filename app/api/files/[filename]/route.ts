import { type NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function GET(request: NextRequest, { params }: { params: { filename: string } }) {
  try {
    const filename = params.filename
    const filepath = join(process.cwd(), "uploads", filename)

    if (!existsSync(filepath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const file = await readFile(filepath)

    // Determine content type based on file extension
    const ext = filename.split(".").pop()?.toLowerCase()
    let contentType = "application/octet-stream"

    switch (ext) {
      case "jpg":
      case "jpeg":
        contentType = "image/jpeg"
        break
      case "png":
        contentType = "image/png"
        break
      case "pdf":
        contentType = "application/pdf"
        break
      case "txt":
        contentType = "text/plain"
        break
    }

    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("File serve error:", error)
    return NextResponse.json({ error: "Failed to serve file" }, { status: 500 })
  }
}
