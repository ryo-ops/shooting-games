// DOM要素の取得
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');

// キャンバスのサイズ設定
canvas.width = 480;
canvas.height = 640;

// ゲームの状態
let score = 0;
let animationId; // ループのIDを管理

// プレイヤー
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 50,
    speed: 5,
    dx: 0,
    color: '#0074d9' // 青色
};

// 弾
let bullets = [];
const bulletSpeed = 7;

// 敵
let enemies = [];
const enemySpeed = 2;
let enemySpawnTimer = 0;

// キー入力の状態
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ' ': false
};

// --- 描画関数 ---
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawBullets() {
    ctx.fillStyle = '#ffdc00'; // 黄色
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

function drawEnemies() {
    ctx.fillStyle = '#ff4136'; // 赤色
    enemies.forEach(enemy => {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

// --- 更新関数 ---
function updatePlayer() {
    player.x += player.dx;
    // 画面外に出ないようにする
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

function updateBullets() {
    bullets.forEach((bullet, index) => {
        bullet.y -= bulletSpeed;
        if (bullet.y + bullet.height < 0) {
            bullets.splice(index, 1);
        }
    });
}

function spawnEnemy() {
    enemySpawnTimer++;
    if (enemySpawnTimer % 100 === 0) { // 100フレームごとに出現
        const size = 30;
        const x = Math.random() * (canvas.width - size);
        const y = -size;
        enemies.push({ x, y, width: size, height: size });
    }
}

function updateEnemies() {
    enemies.forEach((enemy, eIndex) => {
        enemy.y += enemySpeed;
        if (enemy.y > canvas.height) {
            enemies.splice(eIndex, 1);
        }
    });
}

function collisionDetection() {
    // 弾と敵の当たり判定
    bullets.forEach((bullet, bIndex) => {
        enemies.forEach((enemy, eIndex) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                // 当たったら弾と敵を消してスコア加算
                setTimeout(() => { // 同時衝突エラーを避けるため
                    bullets.splice(bIndex, 1);
                    enemies.splice(eIndex, 1);
                    score += 10;
                    scoreEl.textContent = `Score: ${score}`;
                }, 0);
            }
        });
    });

    // 敵とプレイヤーの当たり判定
    enemies.forEach((enemy) => {
        if (
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y
        ) {
            // ゲームオーバーにせず、ゲームの状態をリセットする
            resetOnHit();
        }
    });
}

// --- ゲームループ ---
function gameLoop() {
    // 画面をクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 更新処理
    updatePlayer();
    updateBullets();
    spawnEnemy();
    updateEnemies();
    collisionDetection();

    // 描画処理
    drawPlayer();
    drawBullets();
    drawEnemies();

    animationId = requestAnimationFrame(gameLoop);
}

// --- ゲーム制御 ---
// プレイヤーが被弾した時に呼び出すリセット関数
function resetOnHit() {
    // プレイヤーを初期位置に戻す
    player.x = canvas.width / 2 - 25;
    player.dx = 0;
    // 画面上の敵と弾をすべて消す
    enemies = [];
    bullets = [];
}

// 最初にゲームを開始する関数
function startGame() {
    score = 0;
    scoreEl.textContent = `Score: ${score}`;
    resetOnHit(); // 最初の状態をセット
    gameLoop();   // ゲームループを開始
}

// --- イベントリスナー ---
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        player.dx = -player.speed;
    } else if (e.key === 'ArrowRight') {
        player.dx = player.speed;
    } else if (e.key === ' ' && !keys[' ']) {
        keys[e.key] = true;
        bullets.push({
            x: player.x + player.width / 2 - 2.5,
            y: player.y,
            width: 5,
            height: 10
        });
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        player.dx = 0;
    }
    if (e.key === ' ') {
        keys[e.key] = false;
    }
});

// ゲーム開始
startGame();
