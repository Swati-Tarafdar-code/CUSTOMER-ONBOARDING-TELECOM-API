// // decode-google-creds.js
// import fs from "fs";
// import path from "path";

// const envKey = "GOOGLE_APPLICATION_CREDENTIALS_JSON";
// const outDir = process.env.GOOGLE_CREDS_DIR || "/tmp"; // safe, writable by default
// const outFilename = process.env.GOOGLE_CREDS_FILE || "gcloud-service-account.json";
// const outPath = path.join(outDir, outFilename);

// function writeFileAtomic(targetPath, data) {
//   const tmpPath = `${targetPath}.${process.pid}.tmp`;
//   fs.writeFileSync(tmpPath, data, { mode: 0o600 }); // 0600 permission
//   fs.renameSync(tmpPath, targetPath);
// }

// try {
//   const b64 = process.env[envKey];
//   if (!b64) {
//     // No env var — skip. If you expect it, you might want to throw.
//     // console.warn(`${envKey} not set; skipping credentials write.`);
//   } else {
//     // Decode
//     const json = Buffer.from(b64, "base64").toString("utf-8");

//     // Basic validation (optional)
//     try {
//       JSON.parse(json); // will throw if not valid JSON
//     } catch (err) {
//       console.error("Invalid JSON in GOOGLE_APPLICATION_CREDENTIALS_JSON env var");
//       throw err;
//     }

//     // Ensure output directory exists
//     fs.mkdirSync(outDir, { recursive: true });

//     // Atomic write with restrictive permissions
//     writeFileAtomic(outPath, json);
//     try {
//       // also ensure permissions (redundant with mode in write)
//       fs.chmodSync(outPath, 0o600);
//     } catch (err) {
//       // ignore if not permitted
//     }

//     // Set environment variable expected by Google SDK
//     process.env.GOOGLE_APPLICATION_CREDENTIALS = outPath;

//     // Optionally, unset the base64 env var from process.env to reduce exposure
//     // delete process.env[envKey];
//   }
// } catch (err) {
//   // Fail fast if you prefer; otherwise log and proceed
//   console.error("Failed to write Google service account credentials:", err);
//   // If Google services are critical, rethrow to prevent app from starting
//   throw err;
// }

// // Optionally remove the file on process exit
// process.on("exit", () => {
//   try {
//     if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
//   } catch (e) {}
// });