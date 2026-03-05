import { App, MarkdownView, Modal, Notice } from "obsidian";
import { CameraPluginSettings } from "./SettingsTab";
import { t } from "./i18n";

class CameraModal extends Modal {
	chosenFolderPath: string;
	videoStream: MediaStream = null;
	private cameraSettings: CameraPluginSettings;

	constructor(app: App, cameraSettings: CameraPluginSettings) {
		super(app);
		this.cameraSettings = cameraSettings;
		this.chosenFolderPath = cameraSettings.chosenFolderPath;
	}

	async onOpen() {
		const { contentEl } = this;
		const webCamContainer = contentEl.createDiv();

		const isAndroid = /android/i.test(navigator.userAgent);
		const isMobile = /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);

		const statusMsg = webCamContainer.createEl("span", {
			text: t("modal.loading"),
		});
		const videoEl = webCamContainer.createEl("video");
		const buttonsDiv = webCamContainer.createDiv();
		const firstRow = buttonsDiv.createDiv();
		const secondRow = buttonsDiv.createDiv();
		const recordVideoButton = firstRow.createEl("button", {
			text: t("modal.startRecording"),
		});
		const switchCameraButton = firstRow.createEl("button", {
			text: t("modal.switchCamera"),
		});
		const snapPhotoButton = firstRow.createEl("button", {
			text: t("modal.takeSnap"),
		});
		firstRow.style.display = "none";
		secondRow.style.display = "none";

		if (isMobile) {
			// Two buttons on mobile so camera app can open in video or image mode (fixes Android)
			const filePickerVideo = secondRow.createEl("input", {
				placeholder: t("modal.chooseVideoFile"),
				type: "file",
			});
			filePickerVideo.id = "filepicker-video";
			filePickerVideo.accept = "video/*";
			filePickerVideo.capture = "camcorder";
			filePickerVideo.style.display = "none";

			const labelVideo = secondRow.createEl("label");
			labelVideo.addClass("emic-camera-upload-btn");
			labelVideo.htmlFor = "filepicker-video";
			labelVideo.innerHTML = t("modal.uploadVideo");
			labelVideo.appendChild(filePickerVideo);
			secondRow.appendChild(labelVideo);

			const filePickerImage = secondRow.createEl("input", {
				placeholder: t("modal.chooseImageFile"),
				type: "file",
			});
			filePickerImage.id = "filepicker-image";
			filePickerImage.accept = "image/*";
			filePickerImage.capture = "camera";
			filePickerImage.style.display = "none";

			const labelImage = secondRow.createEl("label");
			labelImage.addClass("emic-camera-upload-btn");
			labelImage.htmlFor = "filepicker-image";
			labelImage.innerHTML = t("modal.uploadImage");
			labelImage.appendChild(filePickerImage);
			secondRow.appendChild(labelImage);
		} else {
			// Single Upload button on desktop (both image and video)
			const filePicker = secondRow.createEl("input", {
				placeholder: t("modal.chooseImageOrVideoFile"),
				type: "file",
			});
			filePicker.id = "filepicker";
			filePicker.accept = "image/*,video/*";
			filePicker.style.display = "none";

			const labelUpload = secondRow.createEl("label");
			labelUpload.addClass("emic-camera-upload-btn");
			labelUpload.htmlFor = "filepicker";
			labelUpload.innerHTML = t("modal.upload");
			labelUpload.appendChild(filePicker);
			secondRow.appendChild(labelUpload);
		}

		videoEl.autoplay = true;
		videoEl.muted = true;
		const chunks: BlobPart[] = [];
		let recorder: MediaRecorder = null;
		this.videoStream = null;

		const view = this.app.workspace.getActiveViewOfType(MarkdownView);

		const saveFile = async (
			file: ArrayBuffer,
			isImage = false,
			fileName = "",
		) => {
			if (!fileName) {
				const dateString = (new Date() + "")
					.slice(4, 28)
					.split(" ")
					.join("_")
					.split(":")
					.join("-");
				fileName = isImage
					? `image_${dateString}.png`
					: `video_${dateString}.webm`;
			}
			new Notice(isImage ? t("modal.addingNewImage") : t("modal.addingNewVideo"));

			const filePath = this.chosenFolderPath + "/" + fileName;
			const folderExists = app.vault.getAbstractFileByPath(
				this.chosenFolderPath,
			);
			if (!folderExists)
				await app.vault.createFolder(this.chosenFolderPath);
			const fileExists = app.vault.getAbstractFileByPath(filePath);
			if (!fileExists) await app.vault.createBinary(filePath, file);

			if (!view) return new Notice(t("modal.savedTo", { path: filePath }));

			const cursor = view.editor.getCursor();
			const w = this.cameraSettings.maxEmbedWidth || 0;
			const h = this.cameraSettings.maxEmbedHeight || 0;
			const sizePart = (w > 0 && h > 0) ? `|${w}x${h}` : (w > 0) ? `|${w}` : "";
			const embedStr = isImage
				? `![[${filePath}${sizePart}]]\n`
				: `\n![[${filePath}${sizePart}]]\n`;
			view.editor.replaceRange(embedStr, cursor);
			this.close();
		};

		const handleImageSelectChange = async (
			file: File,
			isImage: boolean = true,
		) => {
			const bufferFile = await file.arrayBuffer();
			saveFile(bufferFile, isImage, file.name.split(" ").join("-"));
		};

		if (isMobile) {
			const filePickerVideo = secondRow.querySelector("#filepicker-video") as HTMLInputElement;
			const labelVideo = secondRow.querySelector("label[for='filepicker-video']");
			const filePickerImage = secondRow.querySelector("#filepicker-image") as HTMLInputElement;
			const labelImage = secondRow.querySelector("label[for='filepicker-image']");
			filePickerVideo.onchange = () => {
				if (!filePickerVideo.files?.length) return;
				const selectedFile = filePickerVideo.files[0];
				labelVideo?.setText(t("modal.videoLabel", { name: selectedFile.name }));
				handleImageSelectChange(selectedFile, false);
			};
			filePickerImage.onchange = () => {
				if (!filePickerImage.files?.length) return;
				const selectedFile = filePickerImage.files[0];
				labelImage?.setText(t("modal.imageLabel", { name: selectedFile.name }));
				handleImageSelectChange(selectedFile, true);
			};
		} else {
			const filePicker = secondRow.querySelector("#filepicker") as HTMLInputElement;
			const labelUpload = secondRow.querySelector("label[for='filepicker']");
			filePicker.onchange = () => {
				if (!filePicker.files?.length) return;
				const selectedFile = filePicker.files[0];
				const isImage = selectedFile.type.startsWith("image/");
				labelUpload?.setText(t("modal.selectedLabel", { name: selectedFile.name }));
				handleImageSelectChange(selectedFile, isImage);
			};
		}

		if (isAndroid) {
			// Skip streaming on Android (not reliable); show upload buttons only
			videoEl.style.display = "none";
			statusMsg.textContent = t("modal.useButtonsBelow");
			secondRow.style.display = "block";
		} else {
			const cameras = (
				await navigator.mediaDevices.enumerateDevices()
			).filter((d) => d.kind === "videoinput");

			if (cameras.length <= 1) switchCameraButton.style.display = "none";
			let cameraIndex = 0;

			const getVideoStream = async () => {
				try {
					return await navigator.mediaDevices.getUserMedia({
						video: { deviceId: cameras[cameraIndex].deviceId },
						audio: true,
					});
				} catch (error) {
					console.log(error);
					return null;
				}
			};

			this.videoStream = await getVideoStream();
			if (this.videoStream) {
				firstRow.style.display = "block";
				secondRow.style.display = "block";
				statusMsg.style.display = "none";
			} else {
				secondRow.style.display = "block";
				statusMsg.textContent = t("modal.errorLoadingStream");
			}

			switchCameraButton.onclick = async () => {
				cameraIndex = (cameraIndex + 1) % cameras.length;
				this.videoStream = await navigator.mediaDevices.getUserMedia({
					video: { deviceId: cameras[cameraIndex].deviceId },
					audio: true,
				});
				videoEl.srcObject = this.videoStream;
				videoEl.play();
			};

			snapPhotoButton.onclick = () => {
				const canvas = webCamContainer.createEl("canvas");
				canvas.style.display = "none";
				const { videoHeight, videoWidth } = videoEl;
				canvas.height = videoHeight;
				canvas.width = videoWidth;

				canvas
					.getContext("2d")
					.drawImage(videoEl, 0, 0, videoWidth, videoHeight);
				canvas.toBlob(async (blob) => {
					const bufferFile = await blob.arrayBuffer();
					saveFile(bufferFile, true);
				}, "image/png");
			};

			if (this.videoStream) videoEl.srcObject = this.videoStream;

			recordVideoButton.onclick = async () => {
				switchCameraButton.disabled = true;
				if (!recorder) {
					recorder = new MediaRecorder(this.videoStream, {
						mimeType: "video/webm",
					});
				}

				let isRecording: boolean =
					recorder && recorder.state === "recording";
				if (isRecording) {
					recorder.stop();
				} else {
					recorder.start();
				}
				isRecording = !isRecording;
				recordVideoButton.innerText = isRecording
					? t("modal.stopRecording")
					: t("modal.startRecording");

				recorder.ondataavailable = (e) => chunks.push(e.data);
				recorder.onstop = async (_) => {
					const blob = new Blob(chunks, {
						type: "audio/ogg; codecs=opus",
					});
					const bufferFile = await blob.arrayBuffer();
					saveFile(bufferFile, false);
				};
			};
		}
		}

	onClose() {
		const { contentEl } = this;
		this.videoStream?.getTracks().forEach((track) => {
			track.stop();
		});
		contentEl.empty();
	}
}

export default CameraModal;
