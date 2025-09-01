import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { FileUpload } from "../ui/file-upload"
import { jest } from "@jest/globals"

// Mock file for testing
const createMockFile = (name: string, size: number, type: string) => {
  const file = new File([""], name, { type })
  Object.defineProperty(file, "size", { value: size })
  return file
}

describe("FileUpload", () => {
  it("renders upload area", () => {
    render(<FileUpload />)

    expect(screen.getByText("Drag and drop files here, or click to browse")).toBeInTheDocument()
    expect(screen.getByText("Choose Files")).toBeInTheDocument()
  })

  it("handles file selection", async () => {
    const onFilesChange = jest.fn()
    render(<FileUpload onFilesChange={onFilesChange} />)

    const input = screen.getByLabelText("Choose Files")
    const file = createMockFile("test.txt", 1024, "text/plain")

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(onFilesChange).toHaveBeenCalledWith([file])
    })

    expect(screen.getByText("test.txt")).toBeInTheDocument()
  })

  it("validates file size", async () => {
    render(<FileUpload maxSize={1} />)

    const input = screen.getByLabelText("Choose Files")
    const largeFile = createMockFile("large.txt", 2 * 1024 * 1024, "text/plain") // 2MB

    fireEvent.change(input, { target: { files: [largeFile] } })

    // File should be rejected due to size
    await waitFor(() => {
      expect(screen.queryByText("large.txt")).not.toBeInTheDocument()
    })
  })

  it("limits number of files", async () => {
    const onFilesChange = jest.fn()
    render(<FileUpload maxFiles={2} onFilesChange={onFilesChange} />)

    const input = screen.getByLabelText("Choose Files")
    const files = [
      createMockFile("file1.txt", 1024, "text/plain"),
      createMockFile("file2.txt", 1024, "text/plain"),
      createMockFile("file3.txt", 1024, "text/plain"),
    ]

    fireEvent.change(input, { target: { files } })

    await waitFor(() => {
      expect(onFilesChange).toHaveBeenCalledWith([files[0], files[1]])
    })
  })

  it("removes files when delete button is clicked", async () => {
    render(<FileUpload />)

    const input = screen.getByLabelText("Choose Files")
    const file = createMockFile("test.txt", 1024, "text/plain")

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText("test.txt")).toBeInTheDocument()
    })

    const deleteButton = screen.getByRole("button", { name: /remove/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(screen.queryByText("test.txt")).not.toBeInTheDocument()
    })
  })
})
