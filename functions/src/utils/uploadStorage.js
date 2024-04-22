const { getStorage } = require("firebase-admin/storage");

const bucket = getStorage().bucket();

/**
 * upload base64 image to storage. returns the public url and path
 * @param {string} resumeId string: for naming the folder
 * @param {string} file_name string: for naming prefix of the file
 * @param {string} image_url string: for checking if user removes the image (empty string)
 * @param {base64} image_file string (base64): image file in base64
 * @param {string} original_image_path string: for deleting the old image
 * @returns 
 */
async function uploadStorage(resumeId, file_name, image_url, image_file, original_image_path) {
  // if user uploads a new image
  if (image_file) {
    // replace the old image
    if (original_image_path.length > 0) {
      try {
        const oldFile = bucket.file(original_image_path);
        await oldFile.delete();
      } catch (error) {
        console.error(error);
      }
    }
    const imagePath = `resumes/${resumeId}/${file_name}_${Date.now()}`;
    const file = bucket.file(imagePath);

    const imageBase64Arr = image_file.split(",");
    const imageBuffer = Buffer.from(
      imageBase64Arr[imageBase64Arr.length - 1],
      "base64"
    );

    await file.save(imageBuffer, {
      metadata: {
        contentType: imageBase64Arr[0].split(";")[0].split(":")[1],
      },
    });

    const [imageUrl] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 1000 * 60 * 60 * 24 * 365 * 500, // Expires in the next 500 years
    });

    return { imageUrl, imagePath };
  } 
  // if user removes the image
  else if (image_url === "" && original_image_path.length > 0) {
    try {
      const oldFile = bucket.file(original_image_path);
      await oldFile.delete();
    } catch (error) {
      console.error(error);
    }
    return { imageUrl: "", imagePath: "" };
  }
  else {
    return { imageUrl: image_url, imagePath: original_image_path };
  }
}

module.exports = uploadStorage;
