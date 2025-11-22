console.log('IT’S ALIVE!');

function $$(selector, context = document) {
	return Array.from(context.querySelectorAll(selector));
}

let pages = [
	{ url: '', title: 'Home' },
	{ url: 'projects/', title: 'Projects' },
	{ url: 'resume/', title: 'CV' },
	{ url: 'contact/', title: 'Contact' },
	{ url: 'meta/', title: 'Meta' },
	{ url: 'https://github.com/d4phan', title: 'GitHub' }
];

const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
	? "/"
	: "/portfolio/";

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
	let url = p.url;
	let title = p.title;

	if (!url.startsWith('http')) {
		url = BASE_PATH + url;
	}

	let a = document.createElement('a');
	a.href = url;
	a.textContent = title;

	if (a.host === location.host && a.pathname === location.pathname) {
		a.classList.add('current');
	}

	if (a.host !== location.host) {
		a.target = "_blank";
	}

	nav.append(a);
}

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

export async function fetchGitHubData(d4phan) {
	return fetchJSON(`https://api.github.com/users/${d4phan}`);
}

import { fetchJSON } from 'global.js';

let data;
let commits;
let xScale;
let yScale;
let commitProgress = 100;
let timeScale;
let commitMaxTime;
let filteredCommits;

async function loadData() {
    data = await fetchJSON('loc.csv');
    commits = data.commits.map(commit => ({
        ...commit,
        datetime: new Date(commit.datetime)
    }));
    
    commits.forEach(commit => {
        const hours = commit.datetime.getHours();
        const minutes = commit.datetime.getMinutes();
        commit.hourFrac = hours + minutes / 60;
    });
    
    timeScale = d3
        .scaleTime()
        .domain([
            d3.min(commits, (d) => d.datetime),
            d3.max(commits, (d) => d.datetime),
        ])
        .range([0, 100]);
    
    commitMaxTime = timeScale.invert(commitProgress);
    filteredCommits = commits;
    
    renderScatterPlot(data, commits);
    
    document.getElementById('commit-progress').addEventListener('input', onTimeSliderChange);
    onTimeSliderChange();
}

function onTimeSliderChange() {
    const slider = document.getElementById('commit-progress');
    commitProgress = slider.value;
    commitMaxTime = timeScale.invert(commitProgress);
    
    const timeElement = document.getElementById('commit-time');
    timeElement.textContent = commitMaxTime.toLocaleString('en-US', {
        dateStyle: 'long',
        timeStyle: 'short'
    });
    
    filteredCommits = commits.filter((d) => d.datetime <= commitMaxTime);
    updateScatterPlot(data, filteredCommits);
}

function renderScatterPlot(data, commits) {
    const width = 1000;
    const height = 600;
    const margin = { top: 10, right: 10, bottom: 30, left: 20 };
    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
    };

    const svg = d3.select('#chart').append('svg')
        .attr('width', width)
        .attr('height', height);

    xScale = d3.scaleTime()
        .domain(d3.extent(commits, (d) => d.datetime))
        .range([usableArea.left, usableArea.right]);

    yScale = d3.scaleLinear()
        .domain([0, 24])
        .range([usableArea.bottom, usableArea.top]);

    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
    const rScale = d3.scaleSqrt()
        .domain([minLines, maxLines])
        .range([2, 30]);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append('g')
        .attr('transform', `translate(0, ${usableArea.bottom})`)
        .attr('class', 'x-axis')
        .call(xAxis);

    svg.append('g')
        .attr('transform', `translate(${usableArea.left}, 0)`)
        .attr('class', 'y-axis')
        .call(yAxis);

    const dots = svg.append('g').attr('class', 'dots');

    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);
    dots.selectAll('circle')
        .data(sortedCommits)
        .join('circle')
        .attr('cx', (d) => xScale(d.datetime))
        .attr('cy', (d) => yScale(d.hourFrac))
        .attr('r', (d) => rScale(d.totalLines))
        .attr('fill', 'steelblue')
        .style('fill-opacity', 0.7)
        .on('mouseenter', (event, commit) => {
            d3.select(event.currentTarget).style('fill-opacity', 1);
        })
        .on('mouseleave', (event) => {
            d3.select(event.currentTarget).style('fill-opacity', 0.7);
        });
}

function updateScatterPlot(data, commits) {
    const width = 1000;
    const height = 600;
    const margin = { top: 10, right: 10, bottom: 30, left: 20 };
    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
    };

    const svg = d3.select('#chart').select('svg');

    xScale.domain(d3.extent(commits, (d) => d.datetime));

    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
    const rScale = d3.scaleSqrt()
        .domain([minLines, maxLines])
        .range([2, 30]);

    const xAxis = d3.axisBottom(xScale);
    const xAxisGroup = svg.select('g.x-axis');
    xAxisGroup.selectAll('*').remove();
    xAxisGroup.call(xAxis);

    const dots = svg.select('g.dots');
    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);
    
    dots.selectAll('circle')
        .data(sortedCommits, d => d.commit)
        .join('circle')
        .attr('cx', (d) => xScale(d.datetime))
        .attr('cy', (d) => yScale(d.hourFrac))
        .attr('r', (d) => rScale(d.totalLines))
        .attr('fill', 'steelblue')
        .style('fill-opacity', 0.7)
        .on('mouseenter', (event, commit) => {
            d3.select(event.currentTarget).style('fill-opacity', 1);
        })
        .on('mouseleave', (event) => {
            d3.select(event.currentTarget).style('fill-opacity', 0.7);
        });
}

loadData();
