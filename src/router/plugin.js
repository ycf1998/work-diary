const express = require('express')
const formidable = require('express-formidable') // 读取formdata
const template = require('art-template')
const path = require('path')
const fs = require('fs')

const router = express.Router()
router.use(formidable())

const pulginsBasePath = path.join(__dirname, '../public/plugin/')
const pulginsPath = path.join(__dirname, '../public/plugin/plugins.json')

/**
 * 添加插件
 */
router.post('/', (req, res) => {
    let pluginInfo = req.files.pluginInfo;
    let pluginFile = req.files.pluginFile;
    let isPlugin = pluginFile != null;
    res.writeHead(200, {
        'Content-Type': 'application/json'
    });
    if ((isPlugin && pluginFile.type != 'text/javascript') || pluginInfo.type != 'application/json') {
        let resMap = {
            "code": 500,
            "msg": "传啥呢，格式不对啊"
        }
        return res.end(JSON.stringify(resMap));
    }
    if ((isPlugin && pluginFile.size > 10000) || pluginInfo.size > 5000) {
        let resMap = {
            "code": 500,
            "msg": "传尼玛呢，文件这么大！"
        }
        return res.end(JSON.stringify(resMap));
    }
    // 读取插件信息文件
    const result = fs.readFileSync(pluginInfo.path, 'utf-8')
    let plugin = JSON.parse(result)
    if (plugin.name.length < 1 || plugin.auther.length < 1 || plugin.describe.length < 1 || plugin.password.length < 1) {
        let resMap = {
            "code": 500,
            "msg": "插件信息中名称/作者/描述/密码为必填项"
        }
        return res.end(JSON.stringify(resMap));
    }
    if (plugin.version.length < 1) {
        plugin.version = "V1.0.0";
    }
    // 更新插件中心文件
    fs.readFile(pulginsPath, (err, data) => {
        if (err) {
            throw err;
        }
        let plugins = JSON.parse(data);
        let index = plugins.findIndex(item => item.name == plugin.name && item.password == plugin.password);
        // 存在更新，不存在添加
        if (index > -1) {
            if (plugins[index].version == plugin.version) {
                let resMap = {
                    "code": 500,
                    "msg": "已存在该版本插件"
                }
                return res.end(JSON.stringify(resMap));
            }
            plugin.id = plugins[index].id;
            plugin.file = plugins[index].file;
            plugin.createDate = plugins[index].createDate;
            plugin.updateDate = getNow();
            plugins[index] = plugin;
        } else {
            if (plugins.findIndex(item => item.name == plugin.name) > -1) {
                let resMap = {
                    "code": 500,
                    "msg": "已存在该插件（若为更新请保证插件名和密码与原来一致）"
                }
                return res.end(JSON.stringify(resMap));
            }
            let id = 1;
            if (plugins.length > 1) {
                id = parseInt(plugins[plugins.length - 1].id) + 1;
            }
            plugin.id = id;
            plugin.file = '';
            if (isPlugin) {
                let pluginFileSuffix = pluginFile.name.substring(pluginFile.name.lastIndexOf('.'), pluginFile.name.length);
                plugin.file = new Date().getTime().toString() + pluginFileSuffix;
            }
            plugin.open = 1;
            plugin.createDate = getNow();
            limitPush(plugins, plugin);
        }
        fs.writeFile(pulginsPath, JSON.stringify(plugins), function (err) {
            if (err) {
                throw err;
            }
            // 保存插件文件
            if (isPlugin) {
                fs.readFile(pluginFile.path, (err, data) => {
                    if (err) {
                        let resMap = {
                            "code": 404,
                            "msg": "读取插件文件错误"
                        }
                        return res.end(JSON.stringify(resMap));
                    } else {
                        fs.writeFile(pulginsBasePath + plugin.file, data, function (err) {
                            if (err) {
                                throw err;
                            }
                            let resMap = {
                                "code": 200,
                                "msg": "上传成功",
                                "data": {
                                    "fname": plugin.file,
                                    "name": plugin.name
                                }
                            }
                            console.log(getNow() + "$" + req.ip + "#addPlugin:" + plugin.name);
                            return res.end(JSON.stringify(resMap));
                        });
                    }
                })
            } else {
                let resMap = {
                    "code": 200,
                    "msg": "上传成功",
                    "data": {
                        "fname": plugin.file,
                        "name": plugin.name
                    }
                }
                console.log(getNow() + "$" + req.ip + "#addPlugin:" + plugin.name);
                return res.end(JSON.stringify(resMap));
            }
        });
    })
})

/**
 * 获取插件名称数组
 */
router.get('/', (req, res) => {
    fs.readFile(pulginsPath, (err, data) => {
        if (err) {
            throw err;
        }
        let plugins = JSON.parse(data);
        let pluginsFile = plugins.map(plugin => plugin.file).filter(plugin => plugin.file != '');
        plugins = plugins.map(plugin => plugin.name);
        res.writeHead(200, {
            'Content-Type': 'application/json'
        });
        let resMap = {
            "code": 200,
            "msg": "",
            "data": {
                plugins,
                pluginsFile
            }
        }
        return res.end(JSON.stringify(resMap));
    })
});

/**
 * 渲染插件列表html模板
 */
router.get('/list', (req, res) => {
    fs.readFile(pulginsPath, (err, data) => {
        if (err) {
            throw err;
        }
        let plugins = JSON.parse(data);
        fs.readFile(path.join(__dirname, '../views/pluginCenter.html'), 'utf-8', (err, data) => {
            if (err) {
                throw err;
            }
            let htmlStr = template.render(data, {
                plugins
            })
            res.send(htmlStr);
        });
    })
});

/**
 * 删除插件
 */
const token = "money"
router.delete('/:name/:token', (req, res) => {
    let admin = false;
    if (req.params.token == token) {
        admin = true;
    }
    fs.readFile(pulginsPath, (err, data) => {
        if (err) {
            throw err;
        }
        let plugins = JSON.parse(data);
        let index = plugins.findIndex(plugin => plugin.name == req.params.name);
        if (index == -1) {
            res.writeHead(200, {
                'Content-Type': 'application/json'
            });
            let resMap = {
                "code": 200,
                "msg": "没找到"
            }
            return res.end(JSON.stringify(resMap));
        }
        if (plugins[index].password != req.params.token && !admin) {
            res.writeHead(200, {
                'Content-Type': 'application/json'
            });
            let resMap = {
                "code": 500,
                "msg": "密码错误"
            }
            return res.end(JSON.stringify(resMap));
        }
        let deteleFileName = plugins[index].file;
        plugins.splice(index, 1);
        fs.writeFile(pulginsPath, JSON.stringify(plugins), function (err) {
            if (err) {
                throw err;
            }
            fs.unlink(pulginsBasePath + deteleFileName, (err) => {
                if (err) throw err;
                res.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                let resMap = {
                    "code": 200,
                    "msg": "删除成功"
                }
                return res.end(JSON.stringify(resMap));
            });
        });
    })
});

function limitPush(plugins, plugin) {
    let limitPlugin = {
        id: plugin.id,
        file: plugin.file,
        name: plugin.name,
        auther: plugin.auther,
        email: plugin.email,
        icon: plugin.icon,
        describe: plugin.describe,
        detail: plugin.detail,
        version: plugin.version,
        remarks: plugin.remarks,
        password: plugin.password,
        createDate: plugin.createDate,
        updateDate: plugin.updateDate
    }
    plugins.push(limitPlugin);
}

function getNow() {
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    if (month < 10) {
        month = "0" + month;
    }
    let day = now.getDate();
    if (day < 10) {
        day = "0" + day;
    }
    let hour = now.getHours();
    let minute = now.getMinutes();
    if (minute < 10) {
        minute = "0" + minute;
    }
    let second = now.getSeconds();
    if (second < 10) {
        second = "0" + second;
    }
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

module.exports = router