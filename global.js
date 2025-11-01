export function renderProjects(projects, container, headingLevel = 'h2') {
    container.innerHTML = '';
    
    projects.forEach(project => {
        const article = document.createElement('article');
        article.className = 'project';
        
        const heading = document.createElement(headingLevel);
        heading.textContent = project.title;
        
        const img = document.createElement('img');
        img.src = project.image;
        img.alt = project.title;
        
        const textContainer = document.createElement('div');
        textContainer.className = 'project-text';
        
        const description = document.createElement('p');
        description.textContent = project.description;
        
        const year = document.createElement('p');
        year.className = 'project-year';
        year.textContent = project.year;
        
        textContainer.appendChild(description);
        textContainer.appendChild(year);
        
        article.appendChild(heading);
        article.appendChild(img);
        article.appendChild(textContainer);
        
        container.appendChild(article);
    });
}