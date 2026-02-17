//# Generators
document.querySelectorAll('insert').forEach(insert => {
	let file = ''
	if (insert.dataset.file)
		file = insert.dataset.file
	else switch(location.pathname.match(/\/[^/]*$/)[0]) {
		case '/':
		case '/index.html':
			file = 'home.md'
			break
		case '/ras.html':
			file = 'ras.md'
			break
		default:
			file = location.pathname.replace(/\/(.+?)\.html/, '$1.md')
			break
	}
	fetch('./' + file)
		.then(res => {
			if (!res.ok) throw new Error("Failed to load markdown")
			return res.text()
		})
		.then(md => {
			const rendered = renderMD(md)
			insert.outerHTML = `<div data-inserted="${file}"><div class="block">${rendered}</div></div>`
			switch (file) {
				case 'home.md':
					document.querySelector(`div[data-inserted="${file}"]`).querySelectorAll('h2').forEach((h, i) => {
						switch(i) {
							case 0:
								h.innerHTML = `<a href="/ras.html">${h.innerHTML}</a>`
								break
							case 1:
								h.innerHTML = `<a href="/games.html">${h.innerHTML}</a>`
								break
							case 2:
								h.innerHTML = `<a href="/experiments.html">${h.innerHTML}</a>`
								break
							case 3:
								h.innerHTML = `<a href="/letters.html">${h.innerHTML}</a>`
								break
						}
					})
					break
				case 'thoughts.md':
					document.querySelector(`div[data-inserted="${file}"]`).querySelectorAll('h2').forEach((h, i) => {
						switch(i) {
							case 0:
								h.innerHTML = `<a href="/letters.html">${h.innerHTML}</a>`
								break
						}
					})
					break
				case 'ras.md':
					document.querySelectorAll('h1 + p:not(:has(:not(a)))').forEach(e => {
						e.outerHTML = `<p l tac>${e.innerHTML}</p>`
					})
					break
			}
		})
		.catch(err => {
			console.error(err)
		})
})
//# Consts
const replacements = {
	'^\\links([^#<>]+?)$': ['\t<p l>$1</p>', 'gm'],
	//? Markers
	'\\n---\\n': ['</div><div class="divider"></div><div class="block">', 'g'],
	//? Headers
	'###> (.*) \\\\?\\{#?(.*)\\}': ['<h3 ntac id="$2">$1</h3>', 'gm'],
	'##> (.*) \\\\?\\{#?(.*)\\}': ['<h2 ntac id="$2">$1</h2>', 'gm'],
	'#> (.*) \\\\?\\{#?(.*)\\}': ['<h1 ntac id="$2">$1</h1>', 'gm'],
	'###> (.*)': ['<h3 ntac>$1</h3>', 'gm'],
	'##> (.*)': ['<h2 ntac>$1</h2>', 'gm'],
	'#> (.*)': ['<h1 ntac>$1</h1>', 'gm'],
	'### (.*) \\\\?\\{#?(.*)\\}': ['<h3 id="$2">$1</h3>', 'gm'],
	'## (.*) \\\\?\\{#?(.*)\\}': ['<h2 id="$2">$1</h2>', 'gm'],
	'# (.*) \\\\?\\{#?(.*)\\}': ['<h1 id="$2">$1</h1>', 'gm'],
	'### (.*)': ['<h3>$1</h3>', 'gm'],
	'## (.*)': ['<h2>$1</h2>', 'gm'],
	'# (.*)': ['<h1>$1</h1>', 'gm'],
	//? Lists
	'^- (.*)$': ['\t<li>$1</li>', 'gm'],
	'((\\t?<li>.*<\\/li>\\s{2})+)': ['<ul>\n$1</ul>\n', 'g'],
	//? Block quotes
	'^> (.*)': ['\t<blockquote>$1</blockquote>', 'gm'],
	//? Text styling
	'\\*\\*(.*?)\\*\\*': ['<b>$1</b>', 'g'],
	'__(.*?)__': ['<u>$1</u>', 'g'],
	'[\\*_](.*?)[\\*_]': ['<i>$1</i>', 'g'],
	'~~(.*?)~~': ['<s>$1</s>', 'g'],
	'\\[([^[].*?)\\]\\((.*?)\\)': ['<a href="$2">$1</a>', 'g'],
	'>>(.*?)<<': ['<small>$1</small>', 'g'],
	//? Paragraphs
	'^\\ntac(.+?)$': ['\t<p tac>$1</p>', 'gm'],
	'^\\n([^#<>]+?)$': ['\t<p>$1</p>', 'gm'],
	// '': ['', 'g'],
}
//# Helpers
function renderMD(text) {
	let rendered = text

	//? Preprocessing
	rendered = rendered
		.replaceAll(/\r/g, '')
		.replaceAll(/\\n/g, '\\\\n')

	//? Rendering
	for (const [find, [replace, tags]] of Object.entries(replacements)) {
		const regex = new RegExp(find, tags)
		const match = rendered.match(regex)
		rendered = rendered.replace(regex, replace)
	}

	//? Postprodessing
	rendered = rendered
		.replaceAll('\\\\n', '<br>')
	return rendered
}