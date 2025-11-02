import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const projectsTitle = document.querySelector('.projects-title');
projectsTitle.textContent = `${projects.length} Projects`;

let data = [1, 2, 3, 4, 5, 5];

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

let sliceGenerator = d3.pie();
let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));

let customColors = ['#e7abb1ff', '#e74c3c', '#84d788ff', '#25833eff', '#82b0deff', '#1e68e7ff'];
let colors = d3.scaleOrdinal(customColors);

let svg = d3.select('#projects-pie-plot');

arcs.forEach((arc, idx) => {
	svg
		.append('path')
		.attr('d', arc)
		.attr('fill', colors(idx));
});