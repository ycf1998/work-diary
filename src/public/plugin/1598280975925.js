window.$Bullet = {
    data: {
        banner: ``,
        minSize: 10,
        maxSize: 25,
        bullets: [],
        contents: []
    },
    handler: {
        setBanner: (banner) =>{
            this.$Bullet.data.banner = banner;
            console.log(`banner设置成功,当前banner为:`);
            console.log(this.$Bullet.data.banner);
        },
        setMinSize: (size) => {
            if (size instanceof Number) {
                this.$Bullet.data.minSize = parseInt(size) > 0 ? parseInt(size) : 0;
                console.log(`设置成功,当前最小弹幕数${this.$Bullet.data.minSize}`);
            }
        },
        setMaxSize: (size) => {
            if (size instanceof Number) {
                this.$Bullet.data.maxSize = parseInt(size) > 0 ? parseInt(size) : 0;
                console.log(`设置成功,当前最大弹幕数${this.$Bullet.data.maxSize}`);
            }
        },
        setContents: (contentArr) => {
            if(contentArr instanceof Array){
                this.$Bullet.data.contents.push(contentArr);
                console.log(`设置成功,当前弹幕池有内容${this.$Bullet.data.contents.length}条`);
            }
        },
        bind: (selector, event) => {
            //绑定事件
            let nodeList = document.querySelectorAll(selector);
            console.log(`查找到${nodeList.length}个Node,将进行绑定...`);
            for (let i = 0; i < nodeList.length; i++) {
                nodeList[i].addEventListener(event, () => {
                    //弹幕初始化
                    this.$Bullet.methods.generateBullets();
                    //动画
                    this.$Bullet.methods.move();
                });
            }
            console.log(`绑定成功`);
        }
    },
    life:{
        create: () => {
            //初始化
            this.$Bullet.methods.defalutBanner();
            this.$Bullet.methods.defalutContents();

            console.log(this.$Bullet.data.banner);
            console.log(`$Bullet Install ... 200 ok`);
        }
    },
    helper:()=>{
        let help = `$Bullet API:\r\n`;
        help += `绑定到元素: $Bullet.handler.bind(selector, event);\r\n`;
        help += `设置banner: $Bullet.handler.setBanner(banner);\r\n`;
        help += `设置最小弹幕数: $Bullet.handler.setMinSize(size);\r\n`;
        help += `设置最大弹幕数: $Bullet.handler.setMaxSize(size);\r\n`;
        help += `设置弹幕内容池: $Bullet.handler.setContents(contentArr);\r\n`;
        console.log(help);
    },
    methods: {
        defalutBanner: () => {
            let banner = `___.         .__  .__          __ \r\n`;
            banner += `\\_ |__  __ __|  | |  |   _____/  |_  \r\n`;
            banner += `| __ \\|  |  \\  | |  | _/ __ \\   __\\ \r\n`;
            banner += `| \\_\\ \\  |  /  |_|  |_\\  ___/|  | \r\n`;
            banner += `|___  /____/|____/____/\\___  >__| \r\n`;
            banner += `    \\/                     \\/ \r\n`;

            this.$Bullet.data.banner = banner;
        },
        defalutContents: () => {
            let diffDay = this.$Bullet.methods.getAttackTime();
            let workLen = workDiary != undefined ? workDiary.works.length : 0;
            let content = `打工${diffDay}天, 累积${workLen}条!`;

            this.$Bullet.data.contents.push(content);
        },
        getAttackTime: () => {
            let works = workDiary != undefined ? workDiary.works : [];
            if (works instanceof Array) {
                if (works.length > 0) {
                    let beginTime = new Date(works[0].date.split(" ")[0]).getTime();
                    let nowTime = new Date().getTime();
                    let diff = nowTime - beginTime;
                    return parseInt(diff / 86400000) + 1;
                }
            }
            return 0;
        },
        getRandContent: () => {
            let contentsLen = this.$Bullet.data.contents.length;
            let rand = parseInt(Math.random() * 100 % contentsLen);

            return this.$Bullet.data.contents[rand];
        },
        getRandColorCode: () => {
            let color = ['#'];
            for (let i = 0; i < 6; i++) {
                let rand = parseInt(Math.random() * 100 % 16).toString(16);
                color.push(rand);
            }
            return color.join('');
        },
        getRandBulletsSize: (min = this.$Bullet.data.minSize, max = this.$Bullet.data.maxSize) => {
            return parseInt(Math.random() * (max - min)) + min;
        },
        initBullets: () => {
            let size = this.$Bullet.methods.getRandBulletsSize();
            for (let i = 0; i < size; i++) {
                this.$Bullet.data.bullets.push(this.$Bullet.methods.initBullet(i));
            }
        },
        initBullet: (index) => {
            let id = `shahow_bullet_${index}`;
            let height = document.body.clientHeight;
            let rand = Math.random() * 1000;
            let top = parseInt(rand % height);
            let fontSize = parseInt(rand % 50);
            let color = this.$Bullet.methods.getRandColorCode();
            let duration = (parseInt(rand % 15) + 5) * 1000;

            let bullet = `
                    <p id="${id}" style="position: fixed; top: ${top}px; left:110%; font-size: ${fontSize}px; color: ${color}; white-space: nowrap;">
                        ${this.$Bullet.methods.getRandContent()}
                    </p>
                `;

            return {
                id: id,
                content: bullet,
                duration: duration
            }
        },
        generateBullets: () => {
            this.$Bullet.methods.initBullets();
            let bullets = this.$Bullet.data.bullets.length > 0 ? this.$Bullet.data.bullets : initBullets();
            for (b in bullets) {
                document.body.insertAdjacentHTML('beforeend', bullets[b].content);
            }
        },
        move: () => {
            let bullets = this.$Bullet.data.bullets;
            for (b in bullets) {
                let bullet = bullets[b];
                //动画
                document.getElementById(bullet.id).animate([
                    { left: '100%' },
                    { left: '-100%' }
                ], {
                    duration: bullet.duration,
                    iterations: 1
                });

                //销毁元素
                setTimeout(() => {
                    document.getElementById(`${bullet.id}`).remove();
                }, bullet.duration);
            }
        }
    }
};


window.$Bullet.life.create();