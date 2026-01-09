// Resume folder interaction
document.addEventListener('DOMContentLoaded', () => {
    const folderWrapper = document.querySelector('.folder-wrapper');
    const resumeContent = document.querySelector('.resume-content');
    const closeBtn = document.querySelector('.close-resume-btn');

    if (folderWrapper && resumeContent && closeBtn) {
        // Open resume when clicking folder
        folderWrapper.addEventListener('click', () => {
            folderWrapper.classList.add('hidden');
            resumeContent.classList.add('visible');
            closeBtn.classList.remove('hidden');
        });

        // Close resume and show folder again
        closeBtn.addEventListener('click', () => {
            resumeContent.classList.remove('visible');
            closeBtn.classList.add('hidden');
            setTimeout(() => {
                folderWrapper.classList.remove('hidden');
            }, 200);
        });
    }
});
