console.log('IT'S ALIVE!');

function $$(selector, context = document) {
	return Array.from(context.querySelectorAll(selector));
}

let pages = [
	{ url: '#page-home', title: 'Home', section: 'page-home' },
	{ url: '#page-projects', title: 'Projects', section: 'page-projects' },
	{ url: '#page-resume', title: 'CV', section: 'page-resume' },
	{ url: '#page-contact', title: 'Contact', section: 'page-contact' },
	{ url: '#page-meta', title: 'Meta', section: 'page-meta' },
	{ url: 'https://github.com/d4phan', title: 'GitHub' }
];

let nav = document.createElement('nav');
nav.style.position = 'fixed';
nav.style.top = '0';
nav.style.left = '0';
nav.style.right = '0';
nav.style.zIndex = '1000';
nav.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
nav.style.backdropFilter = 'blur(10px)';
document.body.prepend(nav);

for (let p of pages) {
	let a = document.createElement('a');
	a.href = p.url;
	a.textContent = p.title;

	if (p.url.startsWith('http')) {
		a.target = "_blank";
	} else {
		// Smooth scroll to section
		a.addEventListener('click', (e) => {
			e.preventDefault();
			const section = document.getElementById(p.section);
			if (section) {
				section.scrollIntoView({ behavior: 'smooth' });
			}
		});
	}

	nav.append(a);
}

// Update active nav link based on scroll position
const updateActiveNav = () => {
	const sections = document.querySelectorAll('.page-section');

	sections.forEach(section => {
		const rect = section.getBoundingClientRect();
		if (rect.top >= -100 && rect.top <= 100) {
			// Remove current class from all nav links
			nav.querySelectorAll('a').forEach(link => link.classList.remove('current'));
			// Add current class to matching nav link
			const matchingLink = nav.querySelector(`a[href="#${section.id}"]`);
			if (matchingLink) {
				matchingLink.classList.add('current');
			}
		}
	});
};

const scrollContainer = document.querySelector('.scroll-container');
if (scrollContainer) {
	scrollContainer.addEventListener('scroll', updateActiveNav);
}
updateActiveNav();

document.body.insertAdjacentHTML(
	'afterbegin',
	`
	<label class="color-scheme">
		Theme:
		<select>
		<option value="light dark">Automatic</option>
		<option value="light">Light</option>
		<option value="dark">Dark</option>
		</select>
	</label>
	`
);

const select = document.querySelector('.color-scheme select');

if ("colorScheme" in localStorage) {
	const savedScheme = localStorage.colorScheme;
	document.documentElement.style.setProperty('color-scheme', savedScheme);
	select.value = savedScheme;
}
else {
	document.documentElement.style.setProperty('color-scheme', 'light');
	select.value = 'light';
}

select.addEventListener('input', function (event) {
	const newScheme = event.target.value;
	document.documentElement.style.setProperty('color-scheme', newScheme);
	localStorage.colorScheme = newScheme;
});

export async function fetchJSON(url) {
	try {
		const response = await fetch(url);
		
		if (!response.ok) {
			throw new Error(`Failed to fetch projects: ${response.statusText}`);
		}
		
		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching or parsing JSON data:', error);
	}
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
	containerElement.innerHTML = '';
	
	for (let project of projects) {
		const article = document.createElement('article');
		
		const heading = document.createElement(headingLevel);
		heading.textContent = project.title;
		
		const img = document.createElement('img');
		img.src = project.image;
		img.alt = project.title;
		
		const textContainer = document.createElement('div');
		
		const description = document.createElement('p');
		description.textContent = project.description;
		
		const year = document.createElement('p');
		year.textContent = `c. ${project.year}`;
		year.className = 'project-year';
		
		textContainer.append(description, year);
		article.append(heading, img, textContainer);
		containerElement.append(article);
	}
}

export async function fetchGitHubData(username) {
	return fetchJSON(`https://api.github.com/users/${username}`);
}
