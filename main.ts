import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

enum MigrationType {
	Local = "Local",
}

interface PathMigrationPluginSettings {
	type: MigrationType;
}

const DEFAULT_SETTINGS: PathMigrationPluginSettings = {
	type: MigrationType.Local
}

// eslint-disable-next-line no-useless-escape
const OBSIDIAN_FILE_NAME_REGEX = /!\[\[([^(?!\/|\\|:|\*|\?|"|<|>|\|)]+)\.([^(?!\/|\\|:|\*|\?|"|<|>|\|\.)]+)\]\]/;

export default class PathMigrationPlugin extends Plugin {
	settings: PathMigrationPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addRibbonIcon('route', "Migrate Paths", (evt: MouseEvent) => {
			this.migratePaths();
		});

		const imageCounterStatus = this.addStatusBarItem();
		imageCounterStatus.setText("File links: " + await this.getFileLinkCount())

		this.addCommand({
			id: 'migrate-file-paths',
			name: 'Migrate file paths',
			callback: () => this.migratePaths(),
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new PathMigrationSettingTab(this.app, this));
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

		const currentFile = this.app.workspace.getActiveFile();
		if (!currentFile) {
			new Notice("No file currently open for migration");
			return;
		}

		const fileContent: string = await this.app.vault.read(currentFile);

		const fileNames: RegExpExecArray | null = OBSIDIAN_FILE_NAME_REGEX.exec(fileContent);
		if (!fileNames) {
			new Notice("No file links found in document.");
			return;
		}

		const allFiles = this.app.vault.getFiles();
		const filesDict = Object.fromEntries(allFiles.map(f => [`![[${f.name}]]`, f]));
		fileNames.forEach(function (fileName) {
			if (filesDict[fileName]) {
				console.log(fileName);
			}
		});
	}

	async getFileLinkCount(): Promise<number> {
		const currentFile = this.app.workspace.getActiveFile();
		if (currentFile == null) {
			return 0;
		}
		const fileContent: string = await this.app.vault.read(currentFile);

		const fileNames: RegExpExecArray | null = OBSIDIAN_FILE_NAME_REGEX.exec(fileContent);
		if (!fileNames) {
			return 0;
		}
		return fileNames.length;
	}
}

class PathMigrationSettingTab extends PluginSettingTab {
	plugin: PathMigrationPlugin;

	constructor(app: App, plugin: PathMigrationPlugin) {
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
