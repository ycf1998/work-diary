// ===================== V1.0.1 ==========================
const $money = {
	sayHello() {
		return 'Hello, I am Money';
	},
	
	/**
	* 根据日期获取打工记录
	* @param year 年
	* @param month 月
	* @param day 日
	*/
	selectWorksByDate(year=0, month=0, day=0) {
		let works = JSON.parse(localStorage.getItem("works")) || new Array();
		if (year != 0) {
			works = works.filter(work => work.date.match(/\d+/)[0] == year);
		} 
		if (month != 0) {
			works = works.filter(work => (work.date.match(/\d+\/(\d+)/))[1] == month);
		} 
		if (day != 0) {
			works = works.filter(work => work.date.match(/\d+\/\d+\/(\d+)/)[1] == day);
		}
		return works;
	},
	/**
	 * 根据项目名和日期获取打工记录
	 * @param {*} workName 项目名
	 * @param {*} year 年
	 * @param {*} month 月
	 * @param {*} day 日
	 */
	selectWorks(workName = '', year=0, month=0, day=0) {
		let works = this.selectWorksByDate(year, month, day);
		return works.filter(work => work.name == workName);
	},
	/**
	 * 根据项目名和日期获取打工统计
	 * @param {*} workName 项目名
	 * @param {*} year 年
	 * @param {*} month 月
	 * @param {*} day 日
	 */
	queryStatictis(workName = '', year=0, month=0, day=0) {
		let statistics = JSON.parse(localStorage.getItem("statistics")) || new Array();
		let works = this.selectWorksByDate(year, month, day);
		if (workName == '') return statistics;
		if (year == 0) {
			return statistics.filter(s => s.name == workName)[0];
		} else {
			let targetWorks = this.selectWorks(workName, year, month, day);
			let result = {
				"name": workName,
				"bug" : targetWorks.reduce((arr, cur) => (cur.type=='bug' ? 1 : 0) + arr, 0),
				"task" : targetWorks.reduce((arr, cur) => (cur.type=='task' ? 1 : 0) + arr, 0),
				"needs" : targetWorks.reduce((arr, cur) => (cur.type=='needs' ? 1 : 0) + arr, 0),
				"other" : targetWorks.reduce((arr, cur) => (cur.type=='other'? 1 : 0) + arr, 0)
			}
			return result;
		}

	},
	/**
	 * 删除某个插件
	 * @param {*} pluginName 插件名
	 * @param {*} password 密码
	 */
	removePlugin(pluginName = '', password = '') {
		fetch(`/plugins/${pluginName}/${password}`, {
			method: 'delete'
		}).then(res => res.json()).then(data => console.log(data.msg))
	}
}


