document.getElementById('year').textContent = new Date().getFullYear();

async function loadRecentWork() {
  const recentWorkEl = document.getElementById('recent-work');

  if (!recentWorkEl) {
    return;
  }

  const owner = 'sohel364';
  const repo = 'Portfolio';

  try {
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    const repoData = repoRes.ok ? await repoRes.json() : null;
    const repoLanguage = repoData?.language || 'Public repo';

    const commitsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=3`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!commitsRes.ok) {
      throw new Error(`GitHub API request failed: ${commitsRes.status}`);
    }

    const commits = await commitsRes.json();

    if (!Array.isArray(commits) || commits.length === 0) {
      recentWorkEl.innerHTML = `
        <div class="recent-work-header">
          <span class="label">Recent updates</span>
        </div>
        <p><strong>No recent commits found.</strong></p>
      `;
      return;
    }

    const commitList = commits
      .slice(0, 3)
      .map((commit) => {
        const title = (commit.commit.message || 'Untitled update').split('\n')[0].trim();
        const date = new Date(commit.commit.author.date).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });

        return `
          <li class="recent-work-item">
            <div class="commit-topline">
              <span class="commit-language">${repoLanguage}</span>
            </div>
            <a class="commit-title" href="${commit.html_url}" target="_blank" rel="noreferrer">${title}</a>
            <span class="commit-date">${date}</span>
            <a class="change-link" href="${commit.html_url}" target="_blank" rel="noreferrer">View changes</a>
          </li>
        `;
      })
      .join('');

    recentWorkEl.innerHTML = `
      <div class="recent-work-header">
        <span class="label recent-work-title">
          <span class="git-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <circle cx="6" cy="6" r="2.2"></circle>
              <circle cx="18" cy="6" r="2.2"></circle>
              <circle cx="18" cy="18" r="2.2"></circle>
              <path d="M8 6h6a4 4 0 0 1 4 4v4"></path>
              <path d="M8 6v8a4 4 0 0 0 4 4h4"></path>
            </svg>
          </span>
          Recent updates
        </span>
      </div>
      <ul class="recent-work-list">${commitList}</ul>
    `;
  } catch (error) {
    recentWorkEl.innerHTML = `
      <div class="recent-work-header">
        <span class="label recent-work-title">
          <span class="git-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <circle cx="6" cy="6" r="2.2"></circle>
              <circle cx="18" cy="6" r="2.2"></circle>
              <circle cx="18" cy="18" r="2.2"></circle>
              <path d="M8 6h6a4 4 0 0 1 4 4v4"></path>
              <path d="M8 6v8a4 4 0 0 0 4 4h4"></path>
            </svg>
          </span>
          Recent updates
        </span>
      </div>
      <p><strong>Recent updates unavailable.</strong> This repo may be private or the API is blocked.</p>
    `;
  }
}

loadRecentWork();
