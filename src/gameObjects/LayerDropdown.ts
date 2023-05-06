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
      const selectedLayerId = parseInt(event.target.value);
      const layers = this.scene.registry.get("layers");
      const newIndex = layers.findIndex(
        (layer: { id: number }) => layer.id === selectedLayerId
      );
      this.setActiveLayer(newIndex);
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
    layers: { id: number; name: string }[]
  ): string {
    return `
    <select id="layer-dropdown" class="layer-dropdown">
      ${layers
        .map((layer) => `<option value="${layer.id}">${layer.name}</option>`)
        .join("")}
    </select>
  `;
  }

  private selectLayerInDropdown(layerId: number) {
    const layerDropdownElement = this.domElement.getChildByID(
      "layer-dropdown"
    ) as HTMLSelectElement;

    if (layerDropdownElement) {
      layerDropdownElement.value = layerId.toString();
    }
  }

  private createLayer() {
    // Create a new layer
    const layers = this.scene.registry.get("layers");
    const updatedLayers = createLayer(layers); // You need to import the `createLayer` function from "../helpers/layerHelpers"
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
    this.setActiveLayer(updatedLayers.length - 1);
  }

  private deleteLayer() {
    // Get the layer to delete
    const layers = this.scene.registry.get("layers");
    const activeLayer = this.scene.registry.get("activeLayer");
    const layerToDelete = layers[activeLayer];
    if (layers.length === 1) return;
    // Delete the layer
    const updatedLayers = deleteLayer(layers, activeLayer);
    this.scene.registry.set("layers", updatedLayers);
    // Emit an event to update the layers in the editor
    const eventEmitter = this.scene.registry.get("eventEmitter");
    eventEmitter.emit("updateLayers", this.scene, "remove", layerToDelete);
    // Update the layer dropdown
    const layerDropdownElement = this.domElement.getChildByID("layer-dropdown");
    if (layerDropdownElement) {
      layerDropdownElement.innerHTML =
        this.generateLayerDropdownHTML(updatedLayers);
    }
    // Set the new layer as the active layer
    const newIndex = activeLayer === 0 ? 0 : activeLayer - 1;
    this.setActiveLayer(newIndex);
  }

  private setActiveLayer(index: number) {
    this.scene.registry.set("activeLayer", index);
    const layers = this.scene.registry.get("layers");
    this.selectLayerInDropdown(layers[index].id);
  }

  getActiveLayerIndex() {
    return this.scene.registry.get("activeLayer");
  }
}
