console.log('IT\'S ALIVE!');

function $$(selector, context = document) {
	return Array.from(context.querySelectorAll(selector));
}

let pages = [
	{ url: '#home', title: 'Home' },
	{ url: '#projects', title: 'Projects' },
	{ url: '#resume', title: 'CV' },
	{ url: '#meta', title: 'Meta' },
	{ url: 'https://github.com/d4phan', title: 'GitHub' }
];

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
	let a = document.createElement('a');
	a.href = p.url;
	a.textContent = p.title;

	if (p.url.startsWith('http')) {
		a.target = "_blank";
	} else {
		// Smooth scroll to section when clicking nav links
		a.addEventListener('click', (e) => {
			e.preventDefault();
			const sectionId = p.url.replace('#', '');
			const section = document.getElementById(sectionId);
			if (section) {
				section.scrollIntoView({ behavior: 'smooth' });
			}
		});
	}

	nav.append(a);
}

// Update current nav link based on scroll position
function updateCurrentNav() {
	const sections = document.querySelectorAll('.page-section');
	const scrollContainer = document.querySelector('.scroll-container');

	sections.forEach(section => {
		const rect = section.getBoundingClientRect();
		// Check if section is mostly in view
		if (rect.top >= -100 && rect.top <= 150) {
			// Remove current from all links
			nav.querySelectorAll('a').forEach(link => link.classList.remove('current'));
			// Add current to matching link
			const matchingLink = nav.querySelector(`a[href="#${section.id}"]`);
			if (matchingLink) {
				matchingLink.classList.add('current');
			}
		}
	});
}

// Listen for scroll on the scroll container
const scrollContainer = document.querySelector('.scroll-container');
if (scrollContainer) {
	scrollContainer.addEventListener('scroll', updateCurrentNav);
}
// Initial call to set current on page load
updateCurrentNav();

// Intersection Observer for fade-in animations on scroll
const observerOptions = {
	root: scrollContainer,
	threshold: 0.1,
	rootMargin: '0px 0px -50px 0px'
};

const fadeInObserver = new IntersectionObserver((entries) => {
	entries.forEach(entry => {
		if (entry.isIntersecting) {
			entry.target.classList.add('visible');
		}
	});
}, observerOptions);

// Observe all direct children of page-section main elements
document.querySelectorAll('.page-section main').forEach(main => {
	Array.from(main.children).forEach((el, index) => {
		// Add staggered delay based on index within parent
		el.style.transitionDelay = `${index * 0.1}s`;
		fadeInObserver.observe(el);
	});
});

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

// Email popup functionality
const emailToggle = document.getElementById('email-toggle');
const emailPopup = document.getElementById('email-popup');
const emailPopupClose = document.getElementById('email-popup-close');

if (emailToggle && emailPopup) {
	emailToggle.addEventListener('click', () => {
		emailPopup.hidden = !emailPopup.hidden;
	});

	emailPopupClose?.addEventListener('click', () => {
		emailPopup.hidden = true;
	});

	// Close popup when clicking outside
	document.addEventListener('click', (e) => {
		if (!emailPopup.hidden &&
			!emailPopup.contains(e.target) &&
			!emailToggle.contains(e.target)) {
			emailPopup.hidden = true;
		}
	});
}

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
