import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');

let customColors = ['#ffb3ba', '#e74c3c', '#388e3c', '#b5e7a0', '#1976d2', '#aec6cf'];
let selectedIndex = -1;

function renderPieChart(projectsGiven) {
	let rolledData = d3.rollups(
		projectsGiven,
		(v) => v.length,
		(d) => d.year,
	);

	let data = rolledData.map(([year, count]) => {
		return { value: count, label: year };
	});

	let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
	let sliceGenerator = d3.pie().value((d) => d.value);
	let arcData = sliceGenerator(data);
	let arcs = arcData.map((d) => arcGenerator(d));
	let colors = d3.scaleOrdinal(customColors);

	let svg = d3.select('#projects-pie-plot');
	svg.selectAll('path').remove();

	arcs.forEach((arc, i) => {
		svg
			.append('path')
			.attr('d', arc)
			.attr('fill', colors(i))
			.on('click', () => {
				selectedIndex = selectedIndex === i ? -1 : i;

				svg
					.selectAll('path')
					.attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : ''));

				legend
					.selectAll('li')
					.attr('class', (_, idx) => (idx === selectedIndex ? 'legend-item selected' : 'legend-item'));

				if (selectedIndex === -1) {
					renderProjects(projects, projectsContainer, 'h2');
					projectsTitle.textContent = `${projects.length} Projects`;
				} else {
					let selectedYear = data[selectedIndex].label;
					let filteredProjects = projects.filter((project) => project.year === selectedYear);
					renderProjects(filteredProjects, projectsContainer, 'h2');
					projectsTitle.textContent = `${filteredProjects.length} Projects`;
				}
			});
	});

	let legend = d3.select('.legend');
	legend.selectAll('li').remove();

	data.forEach((d, idx) => {
		legend
			.append('li')
			.attr('style', `--color:${colors(idx)}`)
			.attr('class', 'legend-item')
			.html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
	});
}

renderProjects(projects, projectsContainer, 'h2');
renderPieChart(projects);
projectsTitle.textContent = `${projects.length} Projects`;

let query = '';
let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {
	query = event.target.value;

	let filteredProjects = projects.filter((project) => {
		let values = Object.values(project).join('\n').toLowerCase();
		return values.includes(query.toLowerCase());
	});

	renderProjects(filteredProjects, projectsContainer, 'h2');
	renderPieChart(filteredProjects);
	projectsTitle.textContent = `${filteredProjects.length} Projects`;
	selectedIndex = -1;
});