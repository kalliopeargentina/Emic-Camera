import ObsidianCamera from "main";
import { App, PluginSettingTab, Setting } from "obsidian";
import { t } from "./i18n";

export interface CameraPluginSettings {
	chosenFolderPath: string;
	maxEmbedWidth: number;
	maxEmbedHeight: number;
}

export const DEFAULT_SETTINGS: CameraPluginSettings = {
	chosenFolderPath: "attachments/snaps",
	maxEmbedWidth: 800,
	maxEmbedHeight: 600,
};

export default class CameraSettingsTab extends PluginSettingTab {
	plugin: ObsidianCamera;

	constructor(app: App, plugin: ObsidianCamera) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl("h2", { text: t("settings.title") });

		new Setting(containerEl)
			.setName(t("settings.folderPath"))
			.setDesc(t("settings.folderPathDesc"))
			.addText((text) =>
				text
					.setPlaceholder(t("settings.folderPathPlaceholder"))
					.setValue(this.plugin.settings.chosenFolderPath)
					.onChange(async (value) => {
						this.plugin.settings.chosenFolderPath = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName(t("settings.maxEmbedWidth"))
			.setDesc(t("settings.maxEmbedWidthDesc"))
			.addText((text) =>
				text
					.setPlaceholder(t("settings.placeholderWidth"))
					.setValue(String(this.plugin.settings.maxEmbedWidth || ""))
					.onChange(async (value) => {
						const n = parseInt(value, 10);
						this.plugin.settings.maxEmbedWidth = isNaN(n) || n < 0 ? 0 : n;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName(t("settings.maxEmbedHeight"))
			.setDesc(t("settings.maxEmbedHeightDesc"))
			.addText((text) =>
				text
					.setPlaceholder(t("settings.placeholderHeight"))
					.setValue(String(this.plugin.settings.maxEmbedHeight || ""))
					.onChange(async (value) => {
						const n = parseInt(value, 10);
						this.plugin.settings.maxEmbedHeight = isNaN(n) || n < 0 ? 0 : n;
						await this.plugin.saveSettings();
					})
			);
	}
}
