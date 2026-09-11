const MAX_IMAGE_SIZE = 2 * 1024 * 1024 //2 MB

export function validateImage(file: File) {
  if (!file.type.startsWith("image/")) {
    return {
      valid: false,
      error: "Only image files are allowed",
    }
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: "Image must be smaller than 2 MB",
    }
  }

  return {
    valid: true,
    error: null,
  }
}
