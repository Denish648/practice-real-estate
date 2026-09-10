export const DEFAULT_MAX_IMAGE_SIZE_MB = 2
export const MAX_DEAL_IMAGES_COUNT = 5
export const MAX_DEAL_IMAGE_SIZE_MB = 5

export function validateImage(
  file: File,
  maxSizeMb = DEFAULT_MAX_IMAGE_SIZE_MB,
) {
  if (!file.type.startsWith("image/")) {
    return {
      valid: false,
      error: "Only image files are allowed",
    }
  }

  const maxSize = maxSizeMb * 1024 * 1024

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Image must be smaller than ${maxSizeMb} MB`,
    }
  }

  return {
    valid: true,
    error: null,
  }
}

export function validateImageCount(files: File[], maxCount: number) {
  if (files.length > maxCount) {
    return {
      valid: false,
      error: `Maximum ${maxCount} images are allowed`,
    }
  }

  return {
    valid: true,
    error: null,
  }
}
