# Blog media

In Blog / CMS, open a new or existing post. Click between paragraphs, upload media, enter an image description or video title, select the insertion position, and choose Insert into article. Preview, then save or publish. Move or remove an inserted item by cutting/pasting or deleting its Markdown line.

Images: JPEG, PNG, WebP, GIF up to 10 MB. Videos: MP4/WebM up to 100 MB. Videos have controls and do not autoplay. Browser codec support still applies. The first cursor position defaults to the start; Start/End options are also available.

Storage: connect a PUBLIC Vercel Blob store to the project with BLOB_READ_WRITE_TOKEN in Production and Preview, then redeploy. Files upload directly to Blob, avoiding the function request-body size limit. Credentials stay server-side; ADMIN/EDITOR sessions receive short-lived, path-scoped tokens with file-type/size limits and overwrite disabled. SVG, HTML and arbitrary iframe/HTML markup are not enabled.

Uploaded files are public even before the article is published. Removing their Markdown does not delete the stored file. Unused files can be reviewed in Vercel Storage; do not delete media still used by a published post.

Video syntax is ![Accessible title](<https://your-blob-url/video.mp4> "video"). Existing standard Markdown images remain supported. Shared rendering is used in the article, alternate article route, and editor preview.

Validation: node --test outreach-tests/blog-media.test.cjs; npm run build.
