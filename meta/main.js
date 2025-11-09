function renderCommitInfo(data, commits) {
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');

    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append('dd').text(data.length);

    dl.append('dt').text('Total commits');
    dl.append('dd').text(commits.length);

    let numFiles = d3.group(data, d => d.file).size;
    dl.append('dt').text('Number of files');
    dl.append('dd').text(numFiles);

    const fileLengths = d3.rollups(
        data,
        v => d3.max(v, d => d.line),
        d => d.file
    );
    const avgFileLength = d3.mean(fileLengths, d => d[1]);
    dl.append('dt').text('Average file length');
    dl.append('dd').text(avgFileLength.toFixed(2) + ' lines');

    const longestFile = d3.greatest(fileLengths, d => d[1]);
    dl.append('dt').text('Longest file');
    dl.append('dd').html(`${longestFile[0]} (${longestFile[1]} lines)`);

    let avgLineLength = d3.mean(data, d => d.length);
    dl.append('dt').text('Average line length');
    dl.append('dd').text(avgLineLength.toFixed(2) + ' characters');

    const workByPeriod = d3.rollups(
        commits,
        v => v.length,
        d => d.datetime.toLocaleString('en', { dayPeriod: 'short' })
    );
    const mostActivePeriod = d3.greatest(workByPeriod, d => d[1]);
    dl.append('dt').text('Most active period');
    dl.append('dd').text(`${mostActivePeriod[0]} (${mostActivePeriod[1]} commits)`);
}

