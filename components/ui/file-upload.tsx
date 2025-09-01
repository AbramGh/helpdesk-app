"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, X, File, ImageIcon, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  maxFiles?: number
  maxSize?: number // in MB
  acceptedTypes?: string[]
  onFilesChange?: (files: File[]) => void
  className?: string
}

interface UploadedFile {
  file: File
  progress: number
  status: "uploading" | "completed" | "error"
  id: string
}

export function FileUpload({
  maxFiles = 5,
  maxSize = 10,
  acceptedTypes = ["image/*", "application/pdf", ".txt", ".doc", ".docx"],
  onFilesChange,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="h-4 w-4" />
    } else if (file.type.includes("pdf") || file.type.includes("document")) {
      return <FileText className="h-4 w-4" />
    }
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const validateFile = (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`
    }
    return null
  }

  const handleFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles)
      const validFiles: File[] = []

      fileArray.forEach((file) => {
        const error = validateFile(file)
        if (!error && files.length + validFiles.length < maxFiles) {
          validFiles.push(file)
        }
      })

      if (validFiles.length > 0) {
        const uploadedFiles: UploadedFile[] = validFiles.map((file) => ({
          file,
          progress: 0,
          status: "uploading" as const,
          id: Math.random().toString(36).substr(2, 9),
        }))

        setFiles((prev) => [...prev, ...uploadedFiles])
        onFilesChange?.(validFiles)

        // Simulate upload progress
        uploadedFiles.forEach((uploadedFile) => {
          const interval = setInterval(() => {
            setFiles(prev => prev.map(f => 
              f.id === uploadedFile.id 
                ? { ...f, progress: Math.min(f.progress + 10, 100) }
                : f
            ))
          }, 200)

          setTimeout(() => {
            clearInterval(interval)
            setFiles(prev => prev.map(f => 
              f.id === uploadedFile.id 
                ? { ...f, progress: 100, status: "completed" as const }
                : f
            ))
          }, 2000)
        })
      }
    },
    [files.length, maxFiles, maxSize, onFilesChange],
  )

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const droppedFiles = e.dataTransfer.files
      handleFiles(droppedFiles)
    },
    [handleFiles],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop zone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50",
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground mb-2">Drag and drop files here, or click to browse</p>
        <p className="text-xs text-muted-foreground mb-4">
          Maximum {maxFiles} files, up to {maxSize}MB each
        </p>
        <input
          type="file"
          multiple
          accept={acceptedTypes.join(",")}
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        <Button variant="outline" size="sm" asChild>
          <label htmlFor="file-upload" className="cursor-pointer">
            Choose Files
          </label>
        </Button>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((uploadedFile) => (
            <div key={uploadedFile.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              {getFileIcon(uploadedFile.file)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{uploadedFile.file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(uploadedFile.file.size)}</p>
                {uploadedFile.status === "uploading" && <Progress value={uploadedFile.progress} className="h-1 mt-1" />}
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeFile(uploadedFile.id)} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
