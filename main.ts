import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

enum MigrationType {
	Local = "Local",
}

interface ImagePathPluginSettings {
	type: MigrationType;
}

const DEFAULT_SETTINGS: ImagePathPluginSettings = {
	type: MigrationType.Local
}

// eslint-disable-next-line no-useless-escape
const OBSIDIAN_IMAGE_REGEX = /!\[\[([^(?!\/|\\|:|\*|\?|"|<|>|\|)]+)\.([^(?!\/|\\|:|\*|\?|"|<|>|\|\.)]+)\]\]/;

export default class ImagePathPlugin extends Plugin {
	settings: ImagePathPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addRibbonIcon('image', "Migrate Paths", (evt: MouseEvent) => {
			this.migratePaths();
		});

		const imageCounterStatus = this.addStatusBarItem();
		imageCounterStatus.setText("Images: " + await this.getImageCount())

		this.addCommand({
			id: 'migrate-image-paths',
			name: 'Migrate image paths',
			callback: () => this.migratePaths(),
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new ImageMigrationSettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async migratePaths() {
		// new Notice("Migrate Paths");
		this.getAllImagesInFile();
	}

	async getAllImagesInFile() {
		const currentFile = this.app.workspace.getActiveFile();
		if (currentFile == null) {
			return;
		}
		// const fileContent: string = await this.app.vault.read(currentFile);


	}

	async getImageCount(): Promise<number> {
		const currentFile = this.app.workspace.getActiveFile();
		if (currentFile == null) {
			return 0;
		}
		const fileContent: string = await this.app.vault.read(currentFile);

		const images: RegExpExecArray | null = OBSIDIAN_IMAGE_REGEX.exec(fileContent);
		if (!images) {
			return 0;
		}
		return images.length;
	}
}

class ImageMigrationSettingTab extends PluginSettingTab {
	plugin: ImagePathPlugin;

	constructor(app: App, plugin: ImagePathPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Path migration type')
			.setDesc('Type of migration that should be performed')
			.addDropdown(c => {
				const options: Record<string, string> = {};

				Object.keys(MigrationType)
					.map((key: MigrationType) => {
						const enumValue = MigrationType[key];
						options[enumValue] = enumValue;
					});

				return c
					.addOptions(options)
					.onChange(async (value) => {
						new Notice(value);
						await this.plugin.saveSettings();
					});
			});
	}
}
