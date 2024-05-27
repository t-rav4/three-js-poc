import { ShapeBuilder } from "./components/ShapeBuilder";
import { Pickup } from "./Pickup";
import { getRandomVector3 } from "./utils/vectorUtils";

export class PickupManager {
  shapeBuilder: ShapeBuilder;

  constructor(shapeBuilder: ShapeBuilder) {
    this.shapeBuilder = shapeBuilder;
  }

  spawnCoin(coins: number) {
    for (let i = 0; i < coins; i++) {
      const pickup = new Pickup(this.shapeBuilder); // TODO: remove need for passing this in
      pickup.setPosition(getRandomVector3(10));
    }
  }
}
