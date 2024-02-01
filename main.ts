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

export default class ImagePathPlugin extends Plugin {
	settings: ImagePathPluginSettings;

	async onload() {
		await this.loadSettings();

		const changePathsRibbon = this.addRibbonIcon('image', "Migrate Paths", (evt: MouseEvent) => {
			this.migratePaths();
		});

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		this.addCommand({
			id: 'migrate-image-paths',
			name: 'Migrate image paths',
			callback: () => this.migratePaths(),
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
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
		new Notice("Migrate Paths");
	}
}

class SampleSettingTab extends PluginSettingTab {
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
