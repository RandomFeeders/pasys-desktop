window.addEventListener('DOMContentLoaded', () => {
	const exportsDeclaration = document.createElement('script');
	exportsDeclaration.type = 'text/javascript';
	exportsDeclaration.innerHTML = "const { setTimeout, setInterval } = require('timers'); var exports = {};";
	document.head.appendChild(exportsDeclaration);
});
