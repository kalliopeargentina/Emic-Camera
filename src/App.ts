import { Plugin } from "obsidian";
import CameraModal from "./Modal";
import CameraSettingsTab, { DEFAULT_SETTINGS, CameraPluginSettings } from "./SettingsTab";
import { t } from "./i18n";

export default class ObsidianCamera extends Plugin {
  settings: CameraPluginSettings;
  async onload() {
    await this.loadSettings();
    this.addRibbonIcon("camera", t("app.ribbonTitle"), (evt: MouseEvent) => {
      new CameraModal(this.app, this.settings).open();
    });
    this.addSettingTab(new CameraSettingsTab(this.app, this));

    this.addCommand({
      id: "Open camera modal",
      name: t("app.commandName"),
      callback: () => {
        new CameraModal(this.app, this.settings).open();
      },
    });
  }


  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
