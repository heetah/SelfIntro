import './navigation.css';
const header=document.querySelector('header'),nav=header.querySelector('nav');
const about=document.createElement('a');about.href='#about';about.textContent='關於我';
nav.querySelector('a').after(about);document.querySelector('.hero').id='about';
const tools=document.createElement('div');tools.className='nav-tools';tools.setAttribute('role','group');tools.setAttribute('aria-label','閱讀偏好');
tools.append(document.querySelector('#language-toggle'));
nav.after(tools);
