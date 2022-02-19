// 插件
const $plugin = {
	plugins: [],
	init() {
		console.log('init plugins');
		// 初始化插件
		$.get('./plugins', (res) => {
			if (res.data.plugins.length > 0) {
				$plugin.add(res.data.plugins, res.data.pluginsFile);
			}
		})
	},
	add(plugins, pluginsFile) {
		pluginsFile = pluginsFile.filter(file => file != '');
		pluginsFile.forEach(file => $('html').append(`<script src='./public/plugin/${file}'></script>`));
		plugins.forEach(plugin => this.plugins.push(plugin))
		this.load();
	},
	extend(url) {
		plugins.forEach(p => $('html').append(`<script src='${url}'></script>`));
	},
	load() {
		$.get('./plugins/list', (res) => {
			if (res.length > 0) {
				$('#pluginList').html(res);
			}
		})
	}
}
$plugin.init();


// ===============================================
// 打开插件中心
$('#pluginBtn').click(function () {
	$('#pluginCenter').modal('show');
});

// 上传
$('#upload').click(function () {
	$('#upload div').addClass("d-inline-block");
	var pluginInfo = $('#pluginInfo').prop('files');
	var pluginFile = $('#pluginFile').prop('files');
	if (pluginInfo.length < 1) {
		alert("至少需要一个插件信息文件")
		$('#upload div').removeClass("d-inline-block");
		return;
	}
	var data = new FormData();
	data.set('pluginInfo', pluginInfo[0]);
	data.set('pluginFile', pluginFile[0]);
	$.ajax({
		type: 'POST',
		url: "./plugins",
		data: data,
		cache: false,
		processData: false,
		contentType: false,
		success: function (res) {
			$('#upload div').removeClass("d-inline-block");
			if (res.code != 200) {
				alert(res.msg);
				return;
			}
			$plugin.add([res.data.name], [res.data.fname]);
			$('#addPlugin').modal("hide");
		},
		error: function (err) {
			$('#upload div').removeClass("d-inline-block");
		}
	});
	$('#pluginInfo').val('');
	$('#pluginFile').val('');
	$('#pluginInfo').next('label').html('插件信息（.json）');
	$('#pluginFile').next('label').html('插件文件（.js）');
})

$('#uploadHelp').click(function() {
	let template = `{
		"name": "插件名称/必填",
		"auther": "作者/必填",
		"email": "邮箱",
		"icon": "可直接访问的url",
		"describe": "简单的描述/必填",
		"detail": "详细信息",
		"version": "版本号：如V1.0.0",
		"remarks": "备注",
		"password":"用于删除或版本更新的密码"\n}`;
	prompt("插件信息模板：", template);
})
$('#pluginInfo').change(function () {
	$(this).next().html($(this).get(0).files[0].name)
})
$('#pluginFile').change(function () {
	$(this).next().html($(this).get(0).files[0].name)
})
