const workDiary = {
	params: {}, // 参数
	statistics: [], // 统计
	works: [], // 今日打工记录
	num: 1, // 编号
	id: 1,
	monthStatistics: [] // 当月统计
}

// 打工仔
$('#worker').on('input', function() {
	let worker = $(this).val();
	localStorage.setItem('worker', worker);
});

// 初始化
window.onload = function init() {
	console.log('init work-diary-v2.1.0');
	// 加载打工仔
	if (localStorage.getItem('worker')) {
		$('#worker').val(localStorage.getItem('worker'));
	} else {
		$('#worker').val('小叶');
	}
	// 判断是否是新的一天
	let today = localStorage.getItem('today');
	if (today != new Date().getDate()) {
		let yesterday = localStorage.getItem('yesterday');
		let yesterdayAdd = localStorage.getItem('todayAdd');
		let yesterdayResolve = localStorage.getItem('todayResolve');
		let newTaskNum = parseInt(yesterday) + parseInt(yesterdayAdd) - parseInt(yesterdayResolve) || 0;
		// 统计行初始化
		$('#yesterday').text(newTaskNum > 0 ? newTaskNum : 0);
		$('#todayAdd').text(0);
		$('#todayResolve').text(0);
		localStorage.setItem('yesterday', newTaskNum > 0 ? newTaskNum : 0);
		localStorage.setItem('todayAdd', 0);
		localStorage.setItem('todayResolve', 0);
	} else {
		let yesterday = localStorage.getItem('yesterday');
		let todayAdd = localStorage.getItem('todayAdd');
		let todayResolve = localStorage.getItem('todayResolve');
		// 统计行初始化
		$('#yesterday').text(yesterday);
		$('#todayAdd').text(todayAdd);
		$('#todayResolve').text(todayResolve);
	}
	// 初始化今日打工记录
	localStorage.setItem('today', new Date().getDate());
	let tempStatistics =  [...(JSON.parse(localStorage.getItem('statistics'))|| new Array())]; // 暂存总统计
	if (localStorage.getItem('works')) {
		workDiary.works = JSON.parse(localStorage.getItem('works'));
		// 获取id计数器
		workDiary.works.sort((e1, e2) => e1.id - e2.id);
		if (workDiary.works.length > 0) {
			workDiary.id = workDiary.works[workDiary.works.length - 1].id + 1;
		} else {
			workDiary.id = 1;
		}
		let date = /^\d+\/\d+\/\d+/.exec(new Date().toLocaleDateString())[0];
		let month = /^\d+\/\d+/.exec(new Date().toLocaleDateString())[0];
		for (let work of workDiary.works) {
			let workDate = /^\d+\/\d+\/\d+/.exec(work.date)[0];
			let finishDate = work.finishDate ? /^\d+\/\d+\/\d+/.exec(work.finishDate)[0] : '';
			let workMonth = /^\d+\/\d+/.exec(work.date)[0]; 
			// 未解决的、今天的、之前未解决今天解决的
			if (work.status == 0 || workDate == date || finishDate == date) {
				let typeColor = getTypeColor(work.type);
				// 今日新增判断更新
				let addTypeSpan = '';
				let statusBtn = '';
				if (work.addType == 1 && workDate == date) {
					addTypeSpan = '<span class="badge badge-danger">New</span>';
				}
				// 状态判断
				if (work.status == 1) {
					statusBtn = `<button type="button" class="status btn btn-sm btn-success" status="1">已解决,用时:${work.cost}H</button>`;
				} else {
					statusBtn = '<button type="button" class="status btn btn-sm btn-outline-secondary" status="0">点亮解决</button>';
				}
				let html = `<li class='list-group-item shadow p-3 mb-2 bg-white rounded' dataId='${work.id}'>
				<div class='row'>
				  <div class='col-4'>
					<span class='num badge badge-${typeColor}'>${workDiary.num++}</span>
					<button type='button' class='name btn btn-outline-primary btn-sm'>${work.name}</button>
				  </div>
				  <div class='col-8 text-right'>
					${addTypeSpan}
					${statusBtn}
					<button type='button' class='edit btn btn-outline-warning btn-sm'>✎</button>
					<button type='button' class='delete btn btn-outline-danger btn-sm'>✖</button>
				  </div>
				</div>
				<div class='row'>
				  <div class='content col-10 text-truncate'>${work.content}</div>
				  <div class='detail col-10 text-truncate text-muted'>${work.detail}</div>
				</div>
				<footer class='date blockquote-footer text-right'>${work.date}</footer>
			  </li>`;
			  $('.list-group').append(html);
		    }
			if (workMonth == month) {
				// 初始化统计数据/卡片(初始化本月统计monthStatistics)
				updateStatisticsData(work, true);
			}
		}
		localStorage.setItem('works', JSON.stringify(workDiary.works));
	}
	if (tempStatistics) {
		workDiary.statistics = tempStatistics; // 存储的永远是总统计
		localStorage.setItem('statistics', JSON.stringify(workDiary.statistics));
		$('#all .row').html('');
		for (record of workDiary.statistics) {	
			updateStatisticsCard(record, 'all');
		}
	}
}

// 打工
$('#report').click(function() {
	// 获取参数
	let data = getFormObj('reportForm');
	data.id = workDiary.id++;
	data.date = new Date().toLocaleString();
	data.status = 0;
	// 今日新增判断更新
	data.addType = 1;
	let addTypeSpan = '<span class="badge badge-danger">New</span>';
	if ($('#reportForm .addType').attr('addType') == 0) {
		let value = parseInt($('#yesterday').text()) + 1;
		$('#yesterday').text(value);
		localStorage.setItem('yesterday', $('#yesterday').text());
		$('#reportForm .addType').addClass('btn-success');
		$('#reportForm .addType').removeClass('btn-outline-secondary');
		$('#reportForm .addType').attr('addType', 1); // 恢复默认为1
		addTypeSpan = '';
		data.addType = 0;
	} else {
		let value = parseInt($('#todayAdd').text()) + 1;
		$('#todayAdd').text(value);
		localStorage.setItem('todayAdd', $('#todayAdd').text());	
	}
	// 本地数据更新
	workDiary.works.push(data);
	// 关闭模态框
	$('#reportModal').modal('hide')
	// 前端页面数据更新
	let typeColor = getTypeColor(data.type);
	let html = `<li class='list-group-item shadow p-3 mb-2 bg-white rounded' dataId='${data.id}'>
		<div class='row'>
		  <div class='col-4'>
			<span class='num badge badge-${typeColor}'>${workDiary.num++}</span>
			<button type='button' class='name btn btn-outline-primary btn-sm'>${data.name}</button>
		  </div>
		  <div class='col-8 text-right'>
			 ${addTypeSpan}
			<button type="button" class="status btn btn-sm btn-outline-secondary" status="0">点亮解决</button>
			<button type='button' class='edit btn btn-outline-warning btn-sm'>✎</button>
			<button type='button' class='delete btn btn-outline-danger btn-sm'>✖</button>
		  </div>
		</div>
		<div class='row'>
		  <div class='content col-10 text-truncate'>${data.content}</div>
		  <div class='detail col-10 text-truncate text-muted'>${data.detail}</div>
		</div>
		<footer class='date blockquote-footer text-right'>${data.date}</footer>
	  </li>`;
	$('.list-group').append(html);

	// 保存数据
	updateStatisticsData(data, true); // 更新统计
	localStorage.setItem('works', JSON.stringify(workDiary.works));	
});

// 修改数据预填
$(document).on('click', '.edit', function() {
	let id = $(this).parents('li').attr('dataId');
	// 获取数据
	let index = workDiary.works.findIndex(item => item.id == id);
	// 数据预填
	$('#editModal').find('[name="id"]').val(id);
	$('#editModal').find('[name="name"]').val(workDiary.works[index].name);
	$('#editModal').find('[name="type"]').val(workDiary.works[index].type);
	$('#editModal').find('[name="content"]').val(workDiary.works[index].content);
	$('#editModal').find('[name="detail"]').val(workDiary.works[index].detail);
	$('#editModal').find('[name="remarks"]').val(workDiary.works[index].remarks);
	if (workDiary.works[index].addType == 0) {
		$('#editForm .addType').removeClass('btn-success');
		$('#editForm .addType').addClass('btn-outline-secondary');
		$('#editForm .addType').attr('addType', 0); 
	} else {
		$('#editForm .addType').removeClass('btn-outline-secondary');
		$('#editForm .addType').addClass('btn-success');
		$('#editForm .addType').attr('addType', 1); 
	}
	// 打开修改页面
	$('#editModal').modal('show')
});

// 修改
$('#edit').click(function() {
	// 获取参数
	let data = getFormObj('editForm');
	let index = workDiary.works.findIndex(item => item.id == data.id);
	let oldType = workDiary.works[index].type; // 获取旧的类型用于统计
	let oldAddType = workDiary.works[index].addType; 
	let addType = $('#editForm .addType').attr('addType');
	data.addType = oldAddType;
	// 今日新增判断更新
	let addTypeSpan = '';
	if (oldAddType != addType) {
		if (addType == 1) {
			let value = parseInt($('#todayAdd').text()) + 1;
			$('#todayAdd').text(value);
			localStorage.setItem('todayAdd', $('#todayAdd').text());
			addTypeSpan = '<span class="badge badge-danger">New</span>';
			data.addType = 1;
		} else {
			let value = parseInt($('#todayAdd').text()) - 1;
			$('#todayAdd').text(value);
			localStorage.setItem('todayAdd', $('#todayAdd').text());
			data.addType = 0;
		}	
	}
	// 本地数据更新
	workDiary.works[index].name = data.name;
	workDiary.works[index].type = data.type;
	workDiary.works[index].content = data.content;
	workDiary.works[index].detail = data.detail;
	workDiary.works[index].remarks = data.remarks;
	workDiary.works[index].addType = data.addType;
	// 关闭模态框
	$('#editModal').modal('hide')
	// 前端页面数据更新(重填)
	$('#main-list').find('li').each( (index, item) => {
		if (data.id == $(item).attr('dataId')) {
			$(item).find('.num').removeClass('badge-' + getTypeColor(oldType));
			$(item).find('.num').addClass('badge-' + getTypeColor(data.type));
			$(item).find('.name').text(data.name);
			$(item).find('.type').text(data.type);
			$(item).find('.content').text(data.content);
			$(item).find('.detail').text(data.detail);
			$(item).find('.remarks').text(data.remarks);
			if (addType == 1) {
				$(item).find('.col-8').prepend(addTypeSpan);
			} else {
				$(item).find('.col-8 span').remove();
			}
			return true;
		}
	});
	// 保存数据
	updateStatisticsData(data, true, oldType); // 更新统计
	localStorage.setItem('works', JSON.stringify(workDiary.works));
});

// 删除
$(document).on('click', '.delete', function() {
	let id = $(this).parents('li').attr('dataId');
	let index = workDiary.works.findIndex(item => item.id == id);
	let oldWork = workDiary.works[index];
	// 今日新增判断更新
	if (workDiary.works[index].addType == 1) {
		let value = parseInt($('#todayAdd').text()) - 1;
		$('#todayAdd').text(value);
		localStorage.setItem('todayAdd', $('#todayAdd').text());
	}
	// 状态判断更新
	if (workDiary.works[index].status == 1) {
		$('#todayResolve').text(parseInt($('#todayResolve').text()) - 1) // 今日解决减一
		localStorage.setItem('todayResolve', $('#todayResolve').text());
	}
	// 前端页面数据更新
	workDiary.works.splice(index, 1);
	// 重排编号
	$(this).parents('li').nextAll().each((index, item) => {
		let value = $(item).find('.num').text() - 1;
		$(item).find('.num').text(value);
	});
	$(this).parents('li').remove();
	workDiary.num--;
	
	updateStatisticsData(oldWork, false); // 更新统计
	localStorage.setItem('works', JSON.stringify(workDiary.works));
});

// 解决
$(document).on('click', '.status', function() {
	let id = $(this).parents('li').attr('dataId');
	// 本地数据更新
	let index = workDiary.works.findIndex(item => item.id == id);
	let work = workDiary.works[index];
	// 计算用时
	let cost = computeCost(work.date);
	work.cost = cost;
	let status = $(this).attr('status');
	if (status == 0) {
		$(this).removeClass('btn-outline-secondary');
		$(this).addClass('btn-success');
		$(this).html(`已解决,用时:${cost}H`);
		$(this).attr('status', 1);
		work.status = 1;
		work.finishDate = new Date().toLocaleString();
		$('#todayResolve').text(parseInt($('#todayResolve').text()) + 1) // 今日解决加一
	} else {
		$(this).removeClass('btn-success');
		$(this).addClass('btn-outline-secondary');
		$(this).html('点亮解决');
		$(this).attr('status', 0);
		work.status = 0;
		delete work.finishDate;
		$('#todayResolve').text(parseInt($('#todayResolve').text()) - 1) // 今日解决减一
	}
	
	localStorage.setItem('works', JSON.stringify(workDiary.works));
	localStorage.setItem('todayResolve', $('#todayResolve').text());
});

// 血泪史
let reload = false;
$('#history').click( function (){
	if (localStorage.getItem('works') && !reload) {
		let works = JSON.parse(localStorage.getItem('works'));
		if($('#month-tab').hasClass('active')) {
			let month = /^\d+\/\d+/.exec(new Date().toLocaleDateString())[0];
			works = works.filter(work => /^\d+\/\d+/.exec(work.date)[0] == month); 
		}
		$('.list-group').html('');
		workDiary.num = 1;
		for (let work of works) {
			let typeColor = getTypeColor(work.type);
			let html = `<li class='list-group-item shadow p-3 mb-2 bg-white rounded' dataId='${work.id}'>
			<div class='row'>
			  <div class='col-4'>
				<span class='num badge badge-${typeColor}'>${workDiary.num++}</span>
				<button type='button' class='name btn btn-outline-primary btn-sm'>${work.name}</button>
			  </div>
			  <div class='col-8 text-right'>
				<h5><span class='badge badge-success'>您辛苦了!</span></h5>
			  </div>
			</div>
			<div class='row'>
			  <div class='content col-10 text-truncate'>${work.content}</div>
			  <div class='detail col-10 text-truncate text-muted'>${work.detail}</div>
			</div>
			<footer class='date blockquote-footer text-right'>${work.date}</footer>
		  </li>`;
		  $('.list-group').append(html);
		}
		$(this).text('🙈');
		reload = true;
	} else {
		location.reload()
	}
});

// 整理
$('#settle').click(function() {
	let yesterday = $('#yesterday').text();
	let todayAdd = $('#todayAdd').text();
	let todayResolve = $('#todayResolve').text();
	
	let html = `今日工作：\n`;
	let nameNum = 1;
	let num = 1;
	let todayWorks = workDiary.works.filter(e => /^\d+\/\d+\/\d+/.exec(e.date)[0] == /^\d+\/\d+\/\d+/.exec(new Date().toLocaleDateString())[0] 
												|| /^\d+\/\d+\/\d+/.exec(e.finishDate || '1998/07/09')[0] == /^\d+\/\d+\/\d+/.exec(new Date().toLocaleDateString())[0] || e.status == 0);
	todayWorks.sort((e1, e2) => e1.name.localeCompare(e2.name));
	let workName = '';
	for (let work of todayWorks) {
		let finishHtml = '';
		if (work.status == '0') {
			finishHtml = '进行中；';
			work.cost = computeCost(work.date);
		}
		finishHtml += `用时：${work.cost}H`
		if (workName == work.name) {
			html += `\t ${num++}. ${work.content}；${finishHtml}\n`;
		} else {
			num = 1;
			html += `\t${nameNum++}、${work.name}\n\t ${num++}. ${work.content}；${finishHtml}\n`;
		}
		workName = work.name;
	}
	$('#worksText').val(html);
	// 打开模态框
	$('#settleModal').modal('show')
	
});

// ====================================== 功能按钮JS ===============================================
// 复制
$('#copy').click(function() {
	$('#worksText').select();
	try{
    //进行复制到剪切板
		if (document.execCommand('Copy','false',null)) {
		  //如果复制成功
		  alert('复制成功！');  
		} else {
		  //如果复制失败
		  alert('复制失败！');
		}
	} catch(err){
		//如果报错
		alert('复制错误！')
	}
});

// 是否今日新增标记
$('.addType').click(function() {
	if ($(this).attr('addType') == 0) {
		$(this).removeClass('btn-outline-secondary');
		$(this).addClass('btn-success');
		$(this).attr('addType', 1);
	} else {
		$(this).removeClass('btn-success');
		$(this).addClass('btn-outline-secondary');
		$(this).attr('addType', 0);
	}	
});

// 统计行加减操作
$('.add').click(function() {
	let $value = $(this).siblings('.badge');
	let value = parseInt($value.text()) + 1;
	$value.text(value);
	
	if ($value.attr('id') == 'yesterday') {
		localStorage.setItem('yesterday', $('#yesterday').text());
	} else if ($value.attr('id') == 'todayAdd') {
		localStorage.setItem('todayAdd', $('#todayAdd').text());
	} else if ($value.attr('id') == 'todayResolve') {
		localStorage.setItem('todayResolve', $('#todayResolve').text());
	}
});
$('.reduce').click(function() {
	let $value = $(this).siblings('.badge');
	let value = parseInt($value.text()) - 1;
	if (value < 0) return;
	$value.text(value);
	
	if ($value.attr('id') == 'yesterday') {
		localStorage.setItem('yesterday', $('#yesterday').text());
	} else if ($value.attr('id') == 'todayAdd') {
		localStorage.setItem('todayAdd', $('#todayAdd').text());
	} else if ($value.attr('id') == 'todayResolve') {
		localStorage.setItem('todayResolve', $('#todayResolve').text());
	}
});


// ====================================== 业务功能JS ===============================================
/**
* 更新统计数据
* @param work 打工记录
* @param flag 标志 true：报工 false：删除
* @param oldType 修改时需提供旧打工类型
* 
*/
function updateStatisticsData(work, flag, oldType) {
	let name = work.name;
	let bug = 0, task = 0, needs = 0, other = 0;
	if (flag) {
		switch(work.type) {
			case 'bug': bug++;break;
			case 'task': task++;break;
			case 'needs': needs++;break;
			case 'other': other++;
		}
	} else {
		switch(work.type) {
			case 'bug': bug--;break;
			case 'task': task--;break;
			case 'needs': needs--;break;
			case 'other': other--;
		}
	}
	if (oldType) {
		switch(oldType) {
			case 'bug': bug--;break;
			case 'task': task--;break;
			case 'needs': needs--;break;
			case 'other': other--;
		}
	}
	let index = workDiary.statistics.findIndex(item => item.name == name);
	let monthIndex = workDiary.monthStatistics.findIndex(item => item.name == name);
	if (index == -1) {
		let record = {
			'name': work.name,
			'bug': bug,
			'task': task,
			'needs': needs,
			'other': other
		}; 
		workDiary.statistics.push(record);
		// 数据库数据更新
		// 更新统计卡片(新增)
		updateStatisticsCard(record, 'all');
	} else {
		// 总统计
		workDiary.statistics[index]['bug'] += bug;
		workDiary.statistics[index]['task'] += task;
		workDiary.statistics[index]['needs'] += needs;
		workDiary.statistics[index]['other'] += other;
		// 若为删除，无数据了删除统计
		if (!flag && workDiary.statistics[index]['bug'] == 0 && workDiary.statistics[index]['task'] == 0 
			&& workDiary.statistics[index]['needs'] == 0 && workDiary.statistics[index]['other'] == 0) {
			$('#all').find('.col-sm-3').each((index,item) => {
				if (name == $(item).find('.card-title').text()) {
					$(item).remove();
					return false;
				}
			});
			workDiary.statistics.splice(index, 1);
		} else {
			// 更新统计卡片
			updateStatisticsCard(workDiary.statistics[index], 'all');
		}
	}
	if (monthIndex == -1) {
		let record = {
			'name': work.name,
			'bug': bug,
			'task': task,
			'needs': needs,
			'other': other
		};  	
		// 数据库数据更新
		// 更新统计卡片(新增)
		workDiary.monthStatistics.push(record);
		updateStatisticsCard(record, 'month');
	} else {
		// 本月统计
		workDiary.monthStatistics[monthIndex]['bug'] += bug;
		workDiary.monthStatistics[monthIndex]['task'] += task;
		workDiary.monthStatistics[monthIndex]['needs'] += needs;
		workDiary.monthStatistics[monthIndex]['other'] += other;
		// 若为删除，无数据了删除统计
		if (!flag && workDiary.monthStatistics[monthIndex]['bug'] == 0 && workDiary.monthStatistics[monthIndex]['task'] == 0 
			&& workDiary.monthStatistics[monthIndex]['needs'] == 0 && workDiary.monthStatistics[monthIndex]['other'] == 0) {
			$('#month').find('.col-sm-3').each((index, item) => {
				if (name == $(item).find('.card-title').text()) {
					$(item).remove();
					return false;
				}
				workDiary.monthStatistics.splice(monthIndex, 1);
			});
		} else {
			// 更新统计卡片
			updateStatisticsCard(workDiary.monthStatistics[monthIndex], 'month');
		}	
	}
	
	localStorage.setItem('statistics', JSON.stringify(workDiary.statistics));
}

/**
* 更新统计卡片
* @param statistics 统计信息
* @param dateSelect 选项卡id名
*/
function updateStatisticsCard(statistics, dateSelect) {
	let name = statistics.name;
	let len = $('#'+dateSelect).find('.col-sm-3').length;
	let exist = false;
	$('#'+dateSelect).find('.col-sm-3').each((index, item) => {
		if (name == $(item).find('.card-title').text()) {
			$(item).find('.bug').text(statistics['bug']);
			$(item).find('.task').text(statistics['task']);
			$(item).find('.needs').text(statistics['needs']);
			exist = true;
			return false;
		}
		if (index == len -1) {
			exist = false;
		}
	});
	if (!exist) {
		let html = `<div class='col-sm-3'>
						<div class='card'>
						  <div class='card-body'>
							<h5 class='card-title'>${name}</h5>
							<span class='card-subtitle mb-2'>BUG：</span><span class='bug badge badge-success'>${statistics['bug']}</span>
							<span class='card-subtitle mb-2'>任务：</span><span class='task badge badge-info'>${statistics['task']}</span>
							<span class='card-subtitle mb-2'>需求：</span><span class='needs badge badge-warning'>${statistics['needs']}</span>
						  </div>
						</div>
					</div>`;
		$('#'+dateSelect+' .row').append(html);
	}
	
}

/**
* 获得表单数据对象
* @param formId 表单标签的id属性值
*
*/
function getFormObj(formId) {
	var formObj = {};
	var inputs = $('#'+formId).serializeArray();
	$.each(inputs, function (i, input) {
		formObj[input.name] = input.value;
	});
	return formObj;
}

/**
* 获取打工类型对应颜色
* @param type
*/
function getTypeColor(type) {
	switch(type) {
		case 'bug': return 'success';
		case 'task': return 'info';
		case 'needs': return 'warning';
		case 'other': return 'primary';
	}
}

/**
* 计算用时
* @param beginDate
*/
function computeCost(beginDate) {
	let today = /^\d+\/\d+\/\d+/.exec(new Date().toLocaleDateString())[0];
	let workDate = /^\d+\/\d+\/\d+/.exec(beginDate)[0];
	if (today != workDate) {
		beginDate = today + ' 09:00:00';
	}
	if (beginDate.search('上午') >= 0) {
		beginDate = beginDate.replace('上午',' ');
	}
	if (beginDate.search('下午') >= 0) {
		beginDate = beginDate.replace('下午',' ');
		if (parseInt(beginDate.match(/(\d{1,2}):/)[1]) != 12) {
			beginDate = beginDate.replace(/\d{1,2}:/,parseInt(beginDate.match(/(\d{1,2}):/)[1]) + 12 + ':');
		}
	}
	let cost = new Date().getTime() - new Date(beginDate).getTime();
	let leave1 = cost%(24*3600*1000);
    let hours = Math.floor(leave1/(3600*1000));
	if (hours < 1) {
		hours = Math.floor(leave1/(3600*1000) * 10) / 10
	}
	return hours;
}


