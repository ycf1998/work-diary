$(() => {
    $("#history").on("click", () => {
        init();

        let height = document.body.clientHeight;
        let diffDay = getAttackTime();

        let bullets = initBullets(height, diffDay);

        for (b in bullets) {
            $("body").append(bullets[b].content);
        }

        for (b in bullets) {
            let id = bullets[b].id;
            $(`#${id}`).animate({ left: '-100%' }, bullets[b].duration, "linear", () => {
                document.getElementById(`${id}`).remove();
            });
        }
    });
});

function init() {
    let content = `___.         .__  .__          __ \r\n`;
    content += `\\_ |__  __ __|  | |  |   _____/  |_  \r\n`;
    content += `| __ \\|  |  \\  | |  | _/ __ \\   __\\ \r\n`;
    content += `| \\_\\ \\  |  /  |_|  |_\\  ___/|  | \r\n`;
    content += `|___  /____/|____/____/\\___  >__| \r\n`;
    content += `    \\/                     \\/ \r\n`;

    console.log(content);
}

function getAttackTime() {
    let works = workDiary != undefined ? workDiary.works : [];
    if (works instanceof Array) {
        if (works.length > 0) {
            let beginTime = new Date(works[0].date.match(/^(\d+\/)+\d+/g)[0]).getTime();
            let nowTime = new Date().getTime();
            let diff = nowTime - beginTime;
            return parseInt(diff / 86400000) + 1;
        }
        
    }
    return 0;
}

function getColor() {
    let color = ['#'];
    for (let i = 0; i < 6; i++) {
        let rand = parseInt(Math.random() * 100 % 16).toString(16);
        color.push(rand);
    }
    return color.join('');
}

function getBulletsSize(min = 10, max = 25) {
    return parseInt(Math.random() * (max - min)) + min;
}

function initBullets(height, diffDay) {
    let bullets = [];
    let size = getBulletsSize();
    for (let i = 0; i < size; i++) {
        bullets.push(initBullet(height, diffDay, i));
    }
    return bullets;
}

function initBullet(height, diffDay, index) {
    let id = `shahow_bullet_${index}`;
    let rand = Math.random() * 1000;
    let top = parseInt(rand % height);
    let fontSize = parseInt(rand % 50);
    let color = getColor();
    let duration = (parseInt(rand % 15) + 5) * 1000;

    let bullet = `
            <p id="${id}" style="position: fixed; top: ${top}px; left:110%; font-size: ${fontSize}px; color: ${color}; white-space: nowrap;">
                打工${diffDay}天, 累积${workDiary.works.length}条!
            </p>
        `;

    return {
        id: id,
        content: bullet,
        duration: duration
    }
}
