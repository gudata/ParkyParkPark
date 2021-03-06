import config from './config.js';
import { screenShake } from './ScreenShake.js'

export class Wall {
  constructor(x,y,w,h,angle,container,world) {
    this.wallBody = new p2.Body({
      position: [config.scaleFactorX * x / config.zoom, config.scaleFactorY * y / config.zoom],
      mass: 0,
      angle
    });

    this.wallBody.onCollision = (body, otherShape, playerHit) => {
      if (playerHit) {
        screenShake(2, 1)
      }
    };

    this.world = world;
    this.container = container;

    this.boxShape = new p2.Box({ width: config.scaleFactorX * w / config.zoom, height: config.scaleFactorY * h / config.zoom });
    this.boxShape.collisionGroup = config.WALL;
    this.boxShape.collisionMask = config.PLAYER | config.CAR | config.TRUCKBACK;
    this.wallBody.addShape(this.boxShape);

    this.graphics = new PIXI.Graphics();
    this.graphics.beginFill(0xff0000);

    this.graphics.drawRect(-this.boxShape.width / 2, -this.boxShape.height / 2, this.boxShape.width, this.boxShape.height);

    this.graphics.position.x = this.wallBody.position[0];
    this.graphics.position.y = this.wallBody.position[1];
  }

  load() {
    this.world.addBody(this.wallBody);
  }

  debug(toggle) {
    if (!toggle && this.container.getChildIndex(this.graphics) !== -1) {
      this.container.removeChild(this.graphics);
      return
    }

    this.container.addChild(this.graphics);
  }
}
