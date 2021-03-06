# 打工日记

因为打工需要写日报，所以就有了打工日记，来记录打工人的每一天😭。[前往体验](http://175.178.102.32/work-diary/)

> 注：所有打工记录都以`JSON` 格式保存在客户端浏览器的Local Storage中，可放心使用

网站功能总共分为两部分：打工日记 + 插件中心

## 打工日记

### 正常使用流程

1. 上班把今天要搞的进行打工登记
2. 完成后点亮解决
3. 下班点击整理日记
4. 复制整理结果提交去提交日报

### 主界面

仅显示今天和之前为解决的记录

![image-20220219135606618](README.assets/image-20220219135606618.png)

### 打工

新增打工记录，新增后可在主界面进行修改

![image-20220219135750793](README.assets/image-20220219135750793.png)

### 整理

本地部署可到 `public/js/index.js`下修改`整理`方法改变模板（代码都有注释）

![image-20220219135732206](README.assets/image-20220219135732206.png)

## 插件中心

另一个功能是插件功能，作为一种扩展。（位于体验网站的插件是共享的）

### 插件列表

![image-20220219140321425](README.assets/image-20220219140321425.png)

### 添加插件

需上传材料：

- 插件文件（.js）
- 插件描述文件（.json）
  - 点击help获取模板

![image-20220219140339830](README.assets/image-20220219140339830.png)

### 插件🌰

血泪史弹幕就是一个外部插件，通过给界面按钮血泪史额外绑定点击事件实现点击后弹幕显示打工统计。

![image-20220219142737426](README.assets/image-20220219142737426.png)

## 本地部署

- 需要安装`nodeJs`

1. 克隆工程

   ~~~bash
   git clone https://github.com/ycf1998/work-diary.git
   ~~~

2. 安装依赖

   ~~~bash
   npm install
   ~~~

3. 执行

   ~~~bash
   node src/work-diary-app.js
   ~~~

4. 访问 http://localhost:3000

不用一直开着，数据都存在浏览器Local Storage上，进来就会加载。

