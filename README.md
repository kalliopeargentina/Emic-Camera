# Emic-Camera

Camera plugin for Obsidian (https://obsidian.md), designed to work with **Emic QDA Suite**. Version 0.1.

> **Note:** This plugin is based on the original [obsidian-camera](https://github.com/aldrinjenson/obsidian-camera) by Aldrin Jenson. Emic-Camera extends it with mobile support, localization, and settings suited for qualitative research workflows with Emic QDA Suite.

This software is in Beta and may have some issues on certain systems (especially mobile devices).

---

## Features (in detail)

- **Live camera (desktop)**  
  Start the camera from the ribbon or command palette to get a live preview. Switch between cameras if you have more than one.

- **Record video**  
  Record short clips from the live stream. Recordings are saved as WebM in your chosen folder and can be embedded in the active note.

- **Take a snapshot**  
  Capture a still image from the live stream. The image is saved as PNG and embedded in the active note.

- **Upload from device**  
  - **Desktop:** A single “Upload” button lets you pick an image or video file from disk; it is copied into the vault and embedded.  
  - **Mobile (Android / iOS):** Two buttons — “Upload video” and “Upload image” — so the device camera app opens in the right mode (fixes Android issues where a single picker only allowed video).

- **Android behaviour**  
  On Android, the live stream is disabled (often unreliable). Only the upload buttons are shown, with a short message asking you to use them to add video or images.

- **Embed size limits**  
  In **Settings → Emic-Camera** you can set a maximum width and height (in pixels) for embedded images and videos. Embeds use these limits so media does not overwhelm the note (0 = no limit).

- **Save folder**  
  You choose the folder where photos and videos are saved (e.g. `attachments/snaps`). The folder is created automatically if it does not exist.

- **Automatic embedding**  
  If a markdown note is active when you capture or upload, the plugin inserts the correct embed (image or video) at the cursor and closes the modal. If no note is open, the file is still saved and a notice shows the path.

- **Localization (i18n)**  
  The plugin follows the system/browser language: **English** and **Spanish (Castellano)** are supported for all messages, buttons, and settings.

---

## Notes

- The plugin was built primarily with Obsidian desktop in mind.
- On mobile it works mainly via the upload buttons; behaviour may vary by device and manufacturer.

---

## Installation

**From Community plugins**  
Install “Emic-Camera” from Settings → Community plugins.

**Manual**

1. Create a folder named `emic-camera` in `YourVault/.obsidian/plugins/`.
2. Copy into it: `main.js`, `manifest.json`, and `styles.css`.
3. Reload Obsidian.
4. Enable **Emic-Camera** under Settings → Community plugins → Installed plugins.

---

## Usage

- **Ribbon:** Click the camera icon in the left ribbon.  
- **Command palette:** Open the command palette (Ctrl/Cmd+P) and search for “Emic-Camera” or “Open Emic-Camera”.

Then use the modal to start the camera (desktop), record, take a snap, or upload an image/video.

---

## Demo

![demo.gif](demo.gif)
