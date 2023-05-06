import Phaser from "phaser";
import { createLayer, deleteLayer } from "../helpers/layerHelpers";
import { DROPDOWN_STYLE } from "../constants";

export default class LayerDropdown extends Phaser.GameObjects.Container {
  private domElement!: Phaser.GameObjects.DOMElement;
  private addButton!: Phaser.GameObjects.Text;
  private deleteButton!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.createDropdown();
    this.createAddButton();
    this.createDeleteButton();
    this.x =
      x -
      this.domElement.width -
      10 -
      this.addButton.width -
      10 -
      this.deleteButton.width -
      10;

    this.add(this.domElement);
    this.add(this.addButton);
    this.add(this.deleteButton);
  }

  private createDropdown() {
    const layers = this.scene.registry.get("layers");
    this.domElement = this.scene.add
      .dom(0, 0)
      .setOrigin(0, 0.15)
      .createFromHTML(DROPDOWN_STYLE + this.generateLayerDropdownHTML(layers))
      .setDepth(2);

    this.domElement.addListener("change");
    this.domElement.on("change", (event: any) => {
      const selectedLayerIndex = event.target.value;
      this.setActiveLayer(selectedLayerIndex);
    });
  }

  private createAddButton() {
    this.addButton = this.scene.add
      .text(this.domElement.width + 10, 0, "Add", {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setInteractive({
        useHandCursor: true,
      })
      .setDepth(2);

    this.addButton.on("pointerdown", this.createLayer, this);
  }

  private createDeleteButton() {
    this.deleteButton = this.scene.add
      .text(
        this.domElement.width + 10 + this.addButton.width + 10,
        0,
        "Delete",
        {
          fontSize: "24px",
          color: "#ffffff",
        }
      )
      .setInteractive({
        useHandCursor: true,
      })
      .setDepth(2);

    this.deleteButton.on("pointerdown", this.deleteLayer, this);
  }

  private generateLayerDropdownHTML(
    layers: { id: string; name: string }[]
  ): string {
    return `
    <select id="layer-dropdown" class="layer-dropdown">
      ${layers
        .map((layer) => `<option value="${layer.id}">${layer.name}</option>`)
        .join("")}
    </select>
  `;
  }

  private selectLayerInDropdown(id: string) {
    const layerDropdownElement = this.domElement.getChildByID(
      "layer-dropdown"
    ) as HTMLSelectElement;

    if (layerDropdownElement) {
      layerDropdownElement.value = id;
    }
  }

  private createLayer() {
    // Create a new layer
    const layers = this.scene.registry.get("layers");
    const updatedLayers = createLayer(layers);
    this.scene.registry.set("layers", updatedLayers);
    // Emit an event to update the layers in the editor
    const eventEmitter = this.scene.registry.get("eventEmitter");
    eventEmitter.emit(
      "updateLayers",
      this.scene,
      "add",
      updatedLayers.slice(-1)[0]
    );
    // Update the layer dropdown
    const layerDropdownElement = this.domElement.getChildByID("layer-dropdown");
    if (layerDropdownElement) {
      layerDropdownElement.innerHTML =
        this.generateLayerDropdownHTML(updatedLayers);
    }
    // Set the new layer as the active layer
    this.setActiveLayer(updatedLayers[updatedLayers.length - 1].id);
  }

  private deleteLayer() {
    // Get the layer to delete
    const layers = this.scene.registry.get("layers");
    const activeLayer = this.scene.registry.get("activeLayer");
    const activeLayerIndex = layers.findIndex(
      (layer: { id: string }) => layer.id === activeLayer
    );
    if (layers.length === 1) return;
    // Delete the layer
    const updatedLayers = deleteLayer(layers, activeLayer);
    this.scene.registry.set("layers", updatedLayers);
    // Emit an event to update the layers in the editor
    const eventEmitter = this.scene.registry.get("eventEmitter");
    eventEmitter.emit("updateLayers", this.scene, "remove");
    // Update the layer dropdown
    const layerDropdownElement = this.domElement.getChildByID("layer-dropdown");
    if (layerDropdownElement) {
      layerDropdownElement.innerHTML =
        this.generateLayerDropdownHTML(updatedLayers);
    }
    // Set the new layer as the active layer
    const newIndex = activeLayerIndex === 0 ? 0 : activeLayerIndex - 1;
    const newActiveLayer = updatedLayers[newIndex].id;
    this.setActiveLayer(newActiveLayer);
  }

  private setActiveLayer(id: string) {
    this.scene.registry.set("activeLayer", id);
    this.selectLayerInDropdown(id);
  }

  getActiveLayerIndex() {
    return this.scene.registry.get("activeLayer");
  }
}
