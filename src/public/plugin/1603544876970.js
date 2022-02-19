document.addEventListener('click', function(e) {
if (event.target.id == 'call-money-chat') {
let exist = document.getElementById('MoneyChat');
if (!exist) {
//fetch('https://shahow.top/chat/money-chat/api/2.0.0/base').then(res => res.json()).then(json => {
fetch('http://118.31.77.63:3001/money-chat/api/2.0.0/base').then(res => res.json()).then(json => {
    document.body.insertAdjacentHTML('beforeend', json.html);
    let src = document.createElement('script');
    src.innerHTML = json.js;
    document.body.appendChild(src);
});
}
}
});
