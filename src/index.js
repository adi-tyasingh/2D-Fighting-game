import { Sprite, Fighter } from './classes.js';
import { rectCollision, rectifyPosition } from './utils.js';
import { gravity, canvasDimensions } from './constants.js';

// Setup Canvas
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
canvas.width = canvasDimensions.width;
canvas.height = canvasDimensions.height;

console.log('Canvas setup complete:', canvasDimensions);

c.fillRect(0, 0, canvas.width, canvas.height);

// Update image paths to reference the public folder
const background = new Sprite({
  position: { x: 0, y: 0 },
  imageSrc: 'public/assets/background.png', // Public folder reference
  context: c
});

const shop = new Sprite({
  position: { x: 600, y: 128 },
  imageSrc: '/assets/shop.png', // Public folder reference
  scale: 2.5,
  framesMax: 6,
  context: c
});

// Player setup
const player = new Fighter({
  position: { x: 0, y: 0 },
  velocity: { x: 0, y: 10 },
  color: 'orange',
  offset: { x: 0, y: 0 },
  imageSrc: '/assets/samuraiMack/Idle.png', // Public folder reference
  scale: 2.5,
  framesMax: 8,
  offset: { x: 215, y: 250 },
  sprites: {
    idle: { imageSrc: '/assets/samuraiMack/Idle.png', framesMax: 8 },
    run: { imageSrc: '/assets/samuraiMack/Run.png', framesMax: 8 },
    jump: { imageSrc: '/assets/samuraiMack/Jump.png', framesMax: 2 },
    fall: { imageSrc: '/assets/samuraiMack/Fall.png', framesMax: 2 },
    attack1: { imageSrc: '/assets/samuraiMack/Attack1.png', framesMax: 6 },
    attack2: { imageSrc: '/assets/samuraiMack/Attack2.png', framesMax: 6 },
    takeHit: { imageSrc: '/assets/samuraiMack/White.png', framesMax: 4 },
    death: { imageSrc: '/assets/samuraiMack/Death.png', framesMax: 6 },
  },
  attackBox: {
    offset: {
      x: 80,
      y: -50,
    },
    width: 150,
    height: 50,
  },
  context: c,
  canvasHeight: canvas.height 
});

// Enemy setup
const enemy = new Fighter({
  position: { x: 600, y: 0 },
  velocity: { x: 0, y: 0 },
  color: 'red',
  offset: { x: -160, y: 0 },
  imageSrc: '/assets/kenji/Idle.png', // Public folder reference
  scale: 2.5,
  framesMax: 4,
  offset: { x: 215, y: 265 },
  sprites: {
    idle: { imageSrc: '/assets/kenji/Idle.png', framesMax: 4 },
    run: { imageSrc: '/assets/kenji/Run.png', framesMax: 8 },
    jump: { imageSrc: '/assets/kenji/Jump.png', framesMax: 2 },
    fall: { imageSrc: '/assets/kenji/Fall.png', framesMax: 2 },
    attack1: { imageSrc: '/assets/kenji/Attack1.png', framesMax: 4 },
    attack2: { imageSrc: '/assets/kenji/Attack2.png', framesMax: 4 },
    takeHit: { imageSrc: '/assets/kenji/Takehit.png', framesMax: 3 },
    death: { imageSrc: '/assets/kenji/Death.png', framesMax: 7 },
  },
  attackBox: {
    offset: {
      x: -150,
      y: -50,
    },
    width: 150,
    height: 50,
  },
  context: c, 
  canvasHeight: canvas.height
});

// Key configurations
let lastkey_player;
let lastkey_enemy;
const keys_player = {
  a: { pressed: false },
  d: { pressed: false },
  w: { pressed: false },
};

const keys_enemy = {
  a: { pressed: false },
  d: { pressed: false },
  w: { pressed: false },
};

// Timer and gameplay logic
let timerID;
let timer = 60;

function decreaseTimer() {
  if (timer > 0) {
    timerID = setTimeout(decreaseTimer, 1000);
    timer--;
    document.querySelector('#timer').innerHTML = timer;
    console.log(`Timer: ${timer}`);
  }
  if (timer === 0) {
    console.log('Timer ended! Determining winner...');
    determineWinner({ rect1: player, rect2: enemy, timer: timerID });
  }
  if (enemy.health <= 0 || player.health <= 0) {
    console.log('One fighter has no health! Determining winner...');
    determineWinner({ rect1: player, rect2: enemy, timerID: timerID });
  }
}

decreaseTimer();

function animate() {
  window.requestAnimationFrame(animate);
  c.fillStyle = 'black';
  c.fillRect(0, 0, canvas.width, canvas.height);
  background.update();
  shop.update();

  c.fillStyle = 'rgba(255,255,255,0.1)';
  c.fillRect(0, 0, canvas.width, canvas.height);

  player.update();
  enemy.update();

  player.velocity.x = 0;
  if (keys_player.a.pressed && lastkey_player === 'a') {
    player.velocity.x = -5;
    player.switchSprite('run');
  } else if (keys_player.d.pressed && lastkey_player === 'd') {
    player.velocity.x = 5;
    player.switchSprite('run');
  } else {
    player.switchSprite('idle');
  }

  if (keys_player.w.pressed) {
    player.velocity.y = -15;
  }

  if (player.velocity.y < 0) player.switchSprite('jump');
  if (player.velocity.y > 0) player.switchSprite('fall');

  enemy.velocity.x = 0;
  if (keys_enemy.a.pressed && lastkey_enemy === 'a') {
    enemy.velocity.x = -5;
    enemy.switchSprite('run');
  } else if (keys_enemy.d.pressed && lastkey_enemy === 'd') {
    enemy.velocity.x = 5;
    enemy.switchSprite('run');
  } else {
    enemy.switchSprite('idle');
  }

  if (enemy.velocity.y < 0) enemy.switchSprite('jump');
  if (enemy.velocity.y > 0) enemy.switchSprite('fall');

  if (keys_enemy.w.pressed) {
    enemy.velocity.y = -15;
  }

  // Collision Detection
  if (rectCollision({ rect1: player, rect2: enemy }) && player.isAttacking && player.framesCurrent === 4) {
    enemy.takeHit();
    player.isAttacking = false;
    gsap.to('#enemyHealth', { width: enemy.health + '%' });
  }

  if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false;
  }

  if (rectCollision({ rect1: enemy, rect2: player }) && enemy.isAttacking && enemy.framesCurrent === 2) {
    player.takeHit();
    enemy.isAttacking = false;
    gsap.to('#playerHealth', { width: player.health + '%' });
  }

  if (enemy.isAttacking && enemy.framesCurrent === 2) {
    enemy.isAttacking = false;
  }

  rectifyPosition(player);
  rectifyPosition(enemy);
}

animate();

// Event Listeners
window.addEventListener('keydown', (event) => {
  if (!player.dead) {
    switch (event.key) {
      case 'd':
        keys_player.d.pressed = true;
        lastkey_player = 'd';
        break;
      case 'a':
        keys_player.a.pressed = true;
        lastkey_player = 'a';
        break;
      case 'w':
        keys_player.w.pressed = true;
        break;
      case ' ':
        player.attack();
        break;
    }
  }
});

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'd':
      keys_player.d.pressed = false;
      break;
    case 'a':
      keys_player.a.pressed = false;
      break;
    case 'w':
      keys_player.w.pressed = false;
      break;
  }
});

window.addEventListener('keydown', (event) => {
  if (!enemy.dead) {
    switch (event.key) {
      case 'ArrowRight':
        keys_enemy.d.pressed = true;
        lastkey_enemy = 'd';
        break;
      case 'ArrowLeft':
        keys_enemy.a.pressed = true;
        lastkey_enemy = 'a';
        break;
      case 'ArrowUp':
        keys_enemy.w.pressed = true;
        break;
      case 'Shift':
        enemy.attack();
        break;
    }
  }
});

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'ArrowRight':
      keys_enemy.d.pressed = false;
      break;
    case 'ArrowLeft':
      keys_enemy.a.pressed = false;
      break;
    case 'ArrowUp':
      keys_enemy.w.pressed = false;
      break;
  }
});
