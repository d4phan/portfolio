import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

async function loadData() {
    const data = await d3.csv('loc.csv', (row) => ({
        ...row,
        line: Number(row.line),
        depth: Number(row.depth),
        length: Number(row.length),
        date: new Date(row.date + 'T00:00' + row.timezone),
        datetime: new Date(row.datetime),
    }));

    return data;
}

function processCommits(data) {
    return d3
        .groups(data, (d) => d.commit)
        .map(([commit, lines]) => {
            let first = lines[0];

            let { author, date, time, timezone, datetime } = first;

            let ret = {
                id: commit,
                url: 'https://github.com/d4phan/portfolio/commit/' + commit,
                author,
                date,
                time,
                timezone,
                datetime,
                hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
                totalLines: lines.length,
            };

            Object.defineProperty(ret, 'lines', {
                value: lines,
                enumerable: false,
                configurable: true,
                writable: false
            });

            return ret;
        });
}

function renderCommitInfo(data, commits) {
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');

    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append('dd').text(data.length);

    dl.append('dt').text('Total commits');
    dl.append('dd').text(commits.length);

    let files = new Set(data.map(d => d.file)).size;
    dl.append('dt').text('Number of files');
    dl.append('dd').text(files);

    let filesByName = d3.group(data, d => d.file);
    let avgFileLength = d3.mean(filesByName.values(), lines => lines.length);
    dl.append('dt').text('Average file length');
    dl.append('dd').text(avgFileLength.toFixed(2) + ' lines');

    let avgLineLength = d3.mean(data, d => d.length);
    dl.append('dt').text('Average line length');
    dl.append('dd').text(avgLineLength.toFixed(2) + ' characters');

    let dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let commitsByDay = d3.rollup(commits, v => v.length, d => d.datetime.getDay());
    let mostActiveDay = d3.greatest(Array.from(commitsByDay), ([day, count]) => count);
    dl.append('dt').text('Most active day');
    dl.append('dd').text(dayNames[mostActiveDay[0]] + ' (' + mostActiveDay[1] + ' commits)');
}

let data = await loadData();
let commits = processCommits(data);

renderCommitInfo(data, commits);

