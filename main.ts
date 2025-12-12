import {
  App,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  SuggestModal,
  TFile,
  requestUrl,
  moment,
} from 'obsidian';

interface AlbumSearchPluginSettings {
  folder: string;
  fileNameFormat: string;
  templateFile: string;
  spotifyClientId: string;
  spotifyClientSecret: string;
}

const DEFAULT_SETTINGS: AlbumSearchPluginSettings = {
  folder: 'Albums',
  fileNameFormat: '{{title}}',
  templateFile: '',
  spotifyClientId: '',
  spotifyClientSecret: '',
};

interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

interface SpotifyArtist {
  name: string;
}

interface SpotifyAlbum {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  images: SpotifyImage[];
  release_date: string;
  total_tracks: number;
  external_urls: {
    spotify: string;
  };
  album_type: string;
}

export default class AlbumSearchPlugin extends Plugin {
  settings: AlbumSearchPluginSettings;
  accessToken: string = '';
  tokenExpiry: number = 0;

  async onload() {
    await this.loadSettings();

    // Create the command to open the search modal
    this.addCommand({
      id: 'search-album',
      name: 'Search album',
      callback: () => {
        if (
          !this.settings.spotifyClientId ||
          !this.settings.spotifyClientSecret
        ) {
          new Notice(
            'Please set your Spotify client ID and secret in settings.'
          );
          return;
        }
        new AlbumSearchModal(this.app, this).open();
      },
    });

    // Add settings tab
    this.addSettingTab(new AlbumSearchSettingTab(this.app, this));
  }

  async loadSettings() {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      await this.loadData()
    );
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async getSpotifyToken(): Promise<string | null> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const authString = btoa(
        `${this.settings.spotifyClientId}:${this.settings.spotifyClientSecret}`
      );
      const response = await requestUrl({
        url: 'https://accounts.spotify.com/api/token',
        method: 'POST',
        headers: {
          Authorization: `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });

      if (response.status === 200) {
        const data = response.json;
        this.accessToken = data.access_token;
        // Set expiry slightly earlier than actual (3600s) to be safe
        this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
        return this.accessToken;
      } else {
        console.error('Spotify Auth Failed:', response);
        new Notice('Failed to authenticate with Spotify.');
        return null;
      }
    } catch (error) {
      console.error('Spotify Auth Error:', error);
      new Notice('Error authenticating with Spotify.');
      return null;
    }
  }
}

class AlbumSearchModal extends SuggestModal<SpotifyAlbum> {
  plugin: AlbumSearchPlugin;

  constructor(app: App, plugin: AlbumSearchPlugin) {
    super(app);
    this.plugin = plugin;
    this.setPlaceholder('Search for an album...');
  }

  async getSuggestions(query: string): Promise<SpotifyAlbum[]> {
    if (query === '') {
      return [];
    }

    const token = await this.plugin.getSpotifyToken();
    if (!token) return [];

    try {
      const response = await requestUrl({
        url: `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          query
        )}&type=album&limit=20`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        return response.json.albums.items;
      } else {
        new Notice('Failed to search Spotify.');
        return [];
      }
    } catch (error) {
      console.error('Spotify Search Error:', error);
      return [];
    }
  }

  renderSuggestion(album: SpotifyAlbum, el: HTMLElement) {
    const container = el.createDiv({
      cls: 'album-search-suggestion',
    });

    // Add Image
    const imageUrl =
      album.images.length > 0
        ? album.images[album.images.length - 1].url
        : ''; // Use smallest image for thumbnail
    if (imageUrl) {
      container.createEl('img', {
        attr: { src: imageUrl },
        cls: 'album-cover-thumbnail',
      });
    }

    // Add Text Info
    const text = container.createDiv({ cls: 'album-info' });
    text.createDiv({ text: album.name, cls: 'album-name' });
    const artistName = album.artists.map((a) => a.name).join(', ');
    text.createDiv({ text: artistName, cls: 'album-artist' });
    const year = album.release_date
      ? album.release_date.substring(0, 4)
      : '';
    text.createDiv({ text: year, cls: 'album-year' });
  }

  onChooseSuggestion(
    album: SpotifyAlbum,
    evt: MouseEvent | KeyboardEvent
  ) {
    new Notice(`Selected: ${album.name}`);
    this.createAlbumNote(album).catch((err) => {
        console.error("Failed to create album note", err);
        new Notice("Failed to create album note");
    });
  }

  async createAlbumNote(album: SpotifyAlbum) {
    const folderPath = this.plugin.settings.folder;
    const fileNameFormat =
      this.plugin.settings.fileNameFormat ||
      DEFAULT_SETTINGS.fileNameFormat;

    // Ensure folder exists
    if (!this.plugin.app.vault.getAbstractFileByPath(folderPath)) {
      await this.plugin.app.vault.createFolder(folderPath);
    }

    // Prepare variables
    const largeCoverUrl =
      album.images.length > 0 ? album.images[0].url : ''; // Largest image
    const artistName = album.artists.map((a) => a.name).join(', ');
    const year = album.release_date
      ? album.release_date.substring(0, 4)
      : '';
    const date = moment().format('YYYY-MM-DD');

    const variables: { [key: string]: string } = {
      '{{title}}': album.name,
      '{{artist}}': artistName,
      '{{year}}': year,
      '{{date}}': date,
      '{{cover}}': largeCoverUrl,
      '{{coverUrl}}': largeCoverUrl,
      '{{publishYear}}': year,
      '{{genre}}': 'Pop', // Spotify API doesn't return genre on Album object easily without extra calls, defaulted or empty
      '{{tracks}}': String(album.total_tracks),
      '{{url}}': album.external_urls.spotify,
      '{{id}}': album.id,
    };

    // Generate Filename
    let filename = fileNameFormat;
    for (const key in variables) {
      filename = filename.replace(
        new RegExp(key, 'g'),
        this.sanitizeFileName(variables[key])
      );
    }
    filename = this.sanitizeFileName(filename) + '.md';

    const filePath = `${folderPath}/${filename}`;

    // Generate Content
    let content = '';
    const templatePath = this.plugin.settings.templateFile;

    if (templatePath) {
      const templateFile =
        this.plugin.app.vault.getAbstractFileByPath(templatePath);
      if (templateFile instanceof TFile) {
        content = await this.plugin.app.vault.read(templateFile);
      } else {
        new Notice(
          `Template file not found: ${templatePath}. Using default template.`
        );
      }
    }

    if (!content) {
      content = `---
category:
  - "[[Albums]]"
cover: {{coverUrl}}
tags:
  - music
  - albums
  - references
genre: {{genre}}
artist: "[[{{artist}}]]"
year: {{publishYear}}
created: {{date}}
rating: 
---
`;
    }

    for (const key in variables) {
      content = content.replace(new RegExp(key, 'g'), variables[key]);
    }

    try {
      const existingFile =
        this.plugin.app.vault.getAbstractFileByPath(filePath);
      if (existingFile instanceof TFile) {
        new Notice(`File ${filename} already exists!`);
        await this.plugin.app.workspace.getLeaf().openFile(existingFile);
      } else {
        const newFile = await this.plugin.app.vault.create(
          filePath,
          content
        );
        await this.plugin.app.workspace.getLeaf().openFile(newFile);
        new Notice(`Created ${filename}`);
      }
    } catch (error) {
      console.error('Error creating album note:', error);
      new Notice('Error creating album note.');
      throw error;
    }
  }

  sanitizeFileName(name: string): string {
    return name.replace(/[\\/:*?"<>|]/g, '').trim();
  }
}

class AlbumSearchSettingTab extends PluginSettingTab {
  plugin: AlbumSearchPlugin;

  constructor(app: App, plugin: AlbumSearchPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName('Spotify client ID')
      .setDesc('Your Spotify application client ID')
      .addText((text) =>
        text
          .setPlaceholder('Client ID')
          .setValue(this.plugin.settings.spotifyClientId)
          .onChange(async (value) => {
            this.plugin.settings.spotifyClientId = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Spotify client secret')
      .setDesc('Your Spotify application client secret')
      .addText((text) =>
        text
          .setPlaceholder('Client secret')
          .setValue(this.plugin.settings.spotifyClientSecret)
          .onChange(async (value) => {
            this.plugin.settings.spotifyClientSecret = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Folder location')
      .setDesc('Folder to store new album notes')
      .addText((text) =>
        text
          .setPlaceholder('Albums')
          .setValue(this.plugin.settings.folder)
          .onChange(async (value) => {
            this.plugin.settings.folder = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('File name format')
      .setDesc('Available variables: {{title}}, {{artist}}, {{year}}')
      .addText((text) =>
        text
          .setPlaceholder('{{title}}')
          .setValue(this.plugin.settings.fileNameFormat)
          .onChange(async (value) => {
            this.plugin.settings.fileNameFormat = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Template file')
      .setDesc('Path to template file')
      .addText((text) =>
        text
          .setPlaceholder('Templates/Album Template.md')
          .setValue(this.plugin.settings.templateFile)
          .onChange(async (value) => {
            this.plugin.settings.templateFile = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
