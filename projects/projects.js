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

let customColors = ['#9acdf8ff', '#2e7099ff', '#84d788ff', '#25833eff', '#ec8d8dff', '#ec0e0eff'];
let colors = d3.scaleOrdinal(customColors);

let svg = d3.select('#projects-pie-plot');

arcs.forEach((arc, idx) => {
	svg
		.append('path')
		.attr('d', arc)
		.attr('fill', colors(idx));
});