/**
 * Client-side image compression for vehicle photos.
 * Compresses large phone or camera photos to high-quality WebP or JPEG
 * before uploading to Supabase Storage.
 */
export async function compressImage(
  file: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.82
): Promise<{ file: File; previewUrl: string }> {
  // If not an image, return untouched
  if (!file.type.startsWith("image/")) {
    return { file, previewUrl: URL.createObjectURL(file) };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-preserving dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            maxHeight = maxHeight;
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          return resolve({ file, previewUrl: URL.createObjectURL(file) });
        }

        // Draw with high quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Export to modern WebP
        const targetType = "image/webp";

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve({ file, previewUrl: URL.createObjectURL(file) });
            }

            const cleanName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
            const compressedFile = new File([blob], cleanName, {
              type: targetType,
              lastModified: Date.now(),
            });

            resolve({
              file: compressedFile,
              previewUrl: URL.createObjectURL(compressedFile),
            });
          },
          targetType,
          quality
        );
      };

      img.onerror = () => {
        resolve({ file, previewUrl: URL.createObjectURL(file) });
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      resolve({ file, previewUrl: URL.createObjectURL(file) });
    };

    reader.readAsDataURL(file);
  });
}
