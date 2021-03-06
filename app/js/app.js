import config from './config.js';
import { Bomb } from './Bomb.js'
import MainMenu from './menus/MainMenu.js'
import { key, setKey } from './Input.js'
import gamestate from './gamestate'
import menuLoop from './menuLoop.js'
import { shakeUpdate } from './ScreenShake.js'

var world = config.world,
  renderer = config.renderer,
  stage = config.stage,
  container = config.container;

// Cant do this because explosions don't work on sleeping bodies
// world.sleepMode = p2.World.BODY_SLEEPING

// only initialize when all textures are loaded
PIXI.loader.once('complete',init);

function init() {
  const test = renderer.view;
  test.onclick = e => {
    if(gamestate.playing) {
      new Bomb(e.offsetX,-e.offsetY)
    }
  };
  renderer.backgroundColor = 0x040404;
  PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

  stage.addChild(container);
  document.body.appendChild(renderer.view);
  // Add transform to the container
  container.position.x =  0; // center at origin
  container.position.y =  0;
  container.scale.x =  config.zoom; // zoom in
  container.scale.y = -config.zoom; // Note: we flip the y axis to make "up" the physics "up"

  const menu = new MainMenu()
  gamestate.menus.push(menu)
  stage.addChild(menu)


  // TODO: give everything onCollision functions
  world.on('impact',function(evt) {
    const bodyA = evt.bodyA
    const bodyB = evt.bodyB
    const shapeA = evt.shapeA
    const shapeB = evt.shapeB

    if(bodyA.onCollision) {
      bodyA.onCollision(bodyB, shapeA, bodyB === gamestate.player.body);
    }
    if(bodyB.onCollision) {
      bodyB.onCollision(bodyA, shapeB, bodyA === gamestate.player.body);
    }
  });

  window.addEventListener('keydown', evt => {
    setKey(evt.keyCode, 1)
    onInputChange();
  });
  window.addEventListener('keyup', evt => {
    setKey(evt.keyCode, 0)
    onInputChange();
  });


  var wasDebug = false
  function onInputChange() {

    if (key['escape']) {
      // TODO: Toggle the menu
      return
    }

    if (key('debug') && gamestate.mode !== null) {
      wasDebug = !wasDebug
      gamestate.mode.debug(wasDebug)
    }

    if (gamestate.playing) {
      gamestate.player.onInput();
      return
    }

    const { _playing, _level } = gamestate.menus[gamestate.menus.length - 1].onInputChange(gamestate.menus) || {}

    if (_playing !== undefined) {
      gamestate.playing = _playing;
      gamestate.level = _level;
      gamestate.level.load();
    }

    if (gamestate.menus.length === 0) {
      gamestate.playing = true
    }
  }

  // Start up the renderer
  requestAnimationFrame(loop)
}

// Top-level game loop
// You *must* request an animation frome of this loop() from loops you pass this to.
function loop(now) {
  shakeUpdate()

  if (gamestate.mode !== null) {
    gamestate.mode.loop(now, loop)
  } else {
    menuLoop(now, loop)
  }
}
