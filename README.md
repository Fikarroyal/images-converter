# Images Converter

A lightweight, **client-side** image-format converter built with pure HTML, CSS and JavaScript.

## Features

- **Multiple output formats**  
  Convert to **PNG, JPG/JPEG, WebP, GIF, BMP**, and a basic single-size **ICO**.
- **Instant preview**  
  Uploaded images are rendered on a `<canvas>` so you can see the result before downloading.
- **One-click download**  
  The converted file is offered immediately with an appropriate filename.
- **Dark-mode toggle**  
  Remembers your preference via `localStorage`.
- **Responsive design**  
  Mobile-first CSS ensures comfortable use on phones, tablets and desktops.
- **100 % offline**  
  Everything happens locally—no file ever leaves your machine.

## How it works

1. **Upload** – The selected file is read with `FileReader` and drawn onto an off-screen `<canvas>`.
2. **Convert** – `canvas.toBlob()` re-encodes the bitmap using the chosen MIME type (PNG, JPEG, WebP, etc.).
3. **Download** – A temporary object-URL is created and triggered via a hidden anchor element.  
   (ICO is produced by saving a PNG stream with the `.ico` extension; multi-resolution ICOs would need a dedicated library.)

## Roadmap ideas

- Multi-resolution ICO generation (e.g., via *js-ico*)
- Drag-and-drop upload
- Batch conversion
- PWA manifest for installable offline use

## Preview

<img width="544" alt="white" src="https://github.com/user-attachments/assets/3b700f74-d6e8-495f-af31-1f28d8d158e5" />

<img width="544" alt="black" src="https://github.com/user-attachments/assets/e682efdd-55bb-45bb-8b11-420b719b40bd" />



