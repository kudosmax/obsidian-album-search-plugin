# Obsidian Album Search Plugin

This is a plugin for [Obsidian](https://obsidian.md). It allows you to search for albums using the **Spotify API** and create notes with a custom template.

## Features

- **Search**: Search for albums via Spotify.
- **Customizable Note Creation**:
  - Automatically creates a note with album metadata.
  - Customizable file name format (default: `{{title}}`).
  - Customizable content template.
- **Metadata**: Fetches title, artist, year, cover image (high res), total tracks, and Spotify URL.

## Installation

1. Install via **Community Plugins** in Obsidian (once approved).
2. Or, manually install by copying `main.js`, `manifest.json`, `styles.css` to your vault's `.obsidian/plugins/obsidian-album-search-plugin/` folder.

## Setup (Important!)

This plugin uses the **Spotify API**, so you need to provide your own **Client ID** and **Client Secret**.

1. Go to [Spotify for Developers Dashboard](https://developer.spotify.com/dashboard/).
2. Log in and click **"Create App"**.
3. Give it a name (e.g., "Obsidian Search") and description, then click **Save**.
4. In the app settings, find your **Client ID** and **Client Secret**.
5. Open Obsidian Settings > **Album Search Plugin**.
6. Paste your Client ID and Client Secret there.

## Usage

1. Open Command Palette (`Cmd/Ctrl + P`).
2. Type **"Search Album"**.
3. Type an album or artist name.
4. Select the album from the list.
5. A new note will be created!

## Template Variables

You can use these variables in your template file:

- `{{title}}`: Album Name
- `{{artist}}`: Artist Name
- `{{year}}`: Release Year
- `{{date}}`: Today's Date (YYYY-MM-DD)
- `{{cover}}` / `{{coverUrl}}`: Album Cover Image URL
- `{{url}}`: Spotify Link
- `{{tracks}}`: Total Track Count
- `{{id}}`: Spotify Album ID

## Acknowledgements

This plugin was inspired by and referenced [kudosmax/obsidian-album-search-plugin](https://github.com/kudosmax/obsidian-album-search-plugin).
