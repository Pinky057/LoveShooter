const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let score = 0;

canvas.width = 600;
canvas.height = 600;

// Pixel spaceship design
const player = {
    x: canvas.width / 2 - 16,
    y: canvas.height - 60,
    width: 32,
    height: 32,
    speed: 6,
    lives: 3,
    bulletCooldown: 0
};

const enemies = [];
const bullets = [];
const particles = [];

// function drawPlayer() {
//     // Pink pixel spaceship
//     ctx.fillStyle = '#ff69b4';
//     ctx.fillRect(player.x + 8, player.y, 16, 4);
//     ctx.fillRect(player.x + 4, player.y + 4, 24, 4);
//     ctx.fillRect(player.x, player.y + 8, 32, 16);
//     ctx.fillStyle = '#ff1493';
//     ctx.fillRect(player.x + 12, player.y + 8, 8, 8);
// }
function drawPlayer() {
    // Pink pixel spaceship (Balanced with a small top wing)
    ctx.fillStyle = '#ff69b4';

    // Small centered top wing
    ctx.fillRect(player.x + 18, player.y - 4, 8, 4);

    // Adjusted the width to be fully symmetrical
    ctx.fillRect(player.x + 4, player.y, 36, 6); // Top main wing
    ctx.fillRect(player.x - 1, player.y + 6, 46, 6); // Middle section
    ctx.fillRect(player.x -5, player.y + 12, 55, 20); // Main body

    ctx.fillStyle = '#ff1493';
    ctx.fillRect(player.x + 10, player.y + 12, 24, 12); // Hot pink core (perfectly centered)
}


function createBullet() {
    bullets.push({
        x: player.x + 14,
        y: player.y - 4,
        width: 4,
        height: 8,
        speed: 10
    });
}

function drawBullets() {
    ctx.fillStyle = '#ff69b4';
    bullets.forEach((bullet, index) => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        bullet.y -= bullet.speed;
        if (bullet.y < 0) bullets.splice(index, 1);
    });
}

function createEnemy() {
    enemies.push({
        x: Math.random() * (canvas.width - 32),
        y: -32,
        width: 32,
        height: 32,
        speed: Math.random() * 2 + 1,
        frame: 0
    });
}

function drawPixelHeart(x, y, size, color) {
    const heartGrid = [
        [0,1,1,0,1,1,0],
        [1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1],
        [0,1,1,1,1,1,0],
        [0,0,1,1,1,0,0],
        [0,0,0,1,0,0,0]
    ];

    ctx.fillStyle = color;
    for(let row = 0; row < heartGrid.length; row++) {
        for(let col = 0; col < heartGrid[row].length; col++) {
            if(heartGrid[row][col]) {
                ctx.fillRect(
                    x + col * size,
                    y + row * size,
                    size,
                    size
                );
            }
        }
    }
}

function drawEnemies() {
    enemies.forEach((enemy, index) => {
        const pulse = Math.sin(enemy.frame * 0.1) * 2;
        drawPixelHeart(enemy.x - pulse, enemy.y - pulse, 4, '#ff0000');
        enemy.y += enemy.speed;
        enemy.frame++;

        if (enemy.y > canvas.height) enemies.splice(index, 1);
    });
}

function checkCollisions() {
    bullets.forEach((bullet, bIndex) => {
        enemies.forEach((enemy, eIndex) => {
            if (
                bullet.x < enemy.x + 28 &&
                bullet.x + 4 > enemy.x &&
                bullet.y < enemy.y + 28 &&
                bullet.y + 8 > enemy.y
            ) {
                bullets.splice(bIndex, 1);
                enemies.splice(eIndex, 1);
                score += 100;
                document.getElementById('score').textContent = `HEARTS: ${score}`;
                createParticles(enemy.x + 16, enemy.y + 16);
            }
        });
    });

    enemies.forEach((enemy, index) => {
        if (
            player.x < enemy.x + 28 &&
            player.x + 32 > enemy.x &&
            player.y < enemy.y + 28 &&
            player.y + 32 > enemy.y
        ) {
            enemies.splice(index, 1);
            player.lives--;
            document.getElementById('lives').textContent = `LIVES: ${'❤'.repeat(player.lives)}`;
            if(player.lives <= 0) gameOver();
        }
    });
}

function createParticles(x, y) {
    for(let i = 0; i < 20; i++) {
        particles.push({
            x,
            y,
            dx: (Math.random() - 0.5) * 5,
            dy: (Math.random() - 0.5) * 5,
            size: Math.random() * 2 + 2,
            life: 30
        });
    }
}

function drawParticles() {
    ctx.fillStyle = '#ff69b4';
    particles.forEach((p, index) => {
        ctx.fillRect(p.x, p.y, p.size, p.size);
        p.x += p.dx;
        p.y += p.dy;
        p.life--;
        if(p.life <= 0) particles.splice(index, 1);
    });
}

function gameOver() {
    alert(`GAME OVER! FINAL SCORE: ${score}`);
    document.location.reload();
}

function gameLoop() {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawPlayer();
    drawBullets();
    drawEnemies();
    drawParticles();
    checkCollisions();

    player.bulletCooldown--;
    requestAnimationFrame(gameLoop);
}

// Game init
setInterval(createEnemy, 1500);
setInterval(() => score += 10, 1000);

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") player.x = Math.max(0, player.x - player.speed);
    if (e.key === "ArrowRight") player.x = Math.min(canvas.width - player.width, player.x + player.speed);
    if (e.key === " " && player.bulletCooldown <= 0) {
        createBullet();
        player.bulletCooldown = 10;
    }
});

// Touch controls
let touchStartX = 0;
canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    createBullet();
});

canvas.addEventListener('touchmove', (e) => {
    const newX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
    player.x = Math.max(0, Math.min(canvas.width - player.width, newX - player.width/2));
});

gameLoop();
