export const uploadFileController = (req, res) => {
  try {
    res.json({
      message: "File uploaded successfully",
      fileUrl: req.file.location,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "File upload failed" });
  }
};

