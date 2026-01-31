
<div align="center">

# Turkish-SkyStream

**The essential collection of Turkish extensions and providers for SkyStream.**

[![Build Status](https://img.shields.io/github/actions/workflow/status/agnogad/Turkish-SkyStream/Build.yml?style=for-the-badge)](https://github.com/agnogad/Turkish-SkyStream/actions)
[![License](https://img.shields.io/github/license/agnogad/Turkish-SkyStream?style=for-the-badge)](LICENSE)
[![Repo Size](https://img.shields.io/github/repo-size/agnogad/Turkish-SkyStream?style=for-the-badge)](https://github.com/agnogad/Turkish-SkyStream)
[![Language](https://img.shields.io/badge/Language-JavaScript-yellow?style=for-the-badge&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

[Report Bug](https://github.com/agnogad/Turkish-SkyStream/issues) Â· [Request Feature](https://github.com/agnogad/Turkish-SkyStream/issues)

</div>

---

## ðŸ“– About

**Turkish-SkyStream** is a community-driven repository hosting plugins and extensions designed to bring Turkish media content to the SkyStream application.

By adding this repository to your SkyStream app, you unlock access to popular Turkish streaming sites (such as `fullhdfilmizlesene`), allowing for seamless browsing and playback directly within the application. The project uses automated workflows to compile source code into `.sky` format extensions.

## âœ¨ Key Features

*   **ðŸ‡¹ðŸ‡· Localized Content:** Specifically tailored for Turkish audiences, aggregating top local streaming sources.
*   **âš¡ Fast & Lightweight:** Optimized parsing logic ensures quick search results and fast video loading.
*   **ðŸ”„ Auto-Updates:** The repository is structured to support automatic updates via the `repo.json` manifest.
*   **ðŸ§© Modular Design:** Plugins are separated into individual files, making it easy to add or remove specific providers.

## ðŸ›  Tech Stack

*   **Language:** JavaScript (ES6+)
*   **Automation:** GitHub Actions (Automated builds and deployment)
*   **Format:** SkyStream Plugin Architecture (`.sky` files)

## ðŸš€ Getting Started

### For Users (Installation)

To add these plugins to your SkyStream application, follow these steps:

1.  Open the **SkyStream** app on your device.
2.  Navigate to **Settings** > **Extensions** > **Add Repository**.
3.  Enter the URL for the `repo.json` file:
    ```text
    https://raw.githubusercontent.com/agnogad/Turkish-SkyStream/main/repo.json
    ```
4.  Click **Add**. The app will automatically detect and install the available Turkish plugins.

### For Developers (Building from Source)

If you wish to contribute or test locally:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/agnogad/Turkish-SkyStream.git
    cd Turkish-SkyStream
    ```

2.  **Edit or Add Plugins:**
    *   Navigate to the `src/` directory.
    *   Modify existing `.js` files or create a new one using the existing files as a template.

3.  **Build:**
    *   The project uses GitHub Actions to build automatically. However, if you have a local build script (not included in the sample but implied), run it to generate the `.sky` files in the `build/` folder.

## ðŸ“‚ Project Structure

Here is a brief overview of the repository layout:

```text
Turkish-SkyStream/
â”œâ”€â”€ .github/workflows/   # CI/CD pipelines (Auto-build configuration)
â”œâ”€â”€ build/               # Compiled plugins (.sky files) ready for distribution
â”œâ”€â”€ libs/                # Shared helper libraries (e.g., parser.js)
â”œâ”€â”€ src/                 # Source code for individual providers
â”‚   â””â”€â”€ fullhdfilmizlesene.js
â”œâ”€â”€ plugins.json         # Metadata regarding available plugins
â”œâ”€â”€ repo.json            # Main entry point for the SkyStream app
â”œâ”€â”€ LICENSE              # License information
â””â”€â”€ README.md            # Project documentation
```

## ðŸ—º Roadmap

- [x] Initial Repository Setup
- [x] Add `fullhdfilmizlesene` provider
- [x] Implement CI/CD for auto-building `.sky` files
- [ ] Add more Turkish movie providers
- [ ] Add Turkish series/TV show providers
- [ ] Improve parser error handling

## ðŸ¤ Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  **Fork** the Project.
2.  Create your Feature Branch (`git checkout -b feature/NewProvider`).
3.  Commit your Changes (`git commit -m 'Add new provider: ExampleSite'`).
4.  Push to the Branch (`git push origin feature/NewProvider`).
5.  Open a **Pull Request**.

## ðŸ“„ License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <p>Created by <a href="https://github.com/agnogad">agnogad</a></p>
</div>
