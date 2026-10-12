document.getElementById('year').textContent = new Date().getFullYear();

async function loadRecentWork() {
  const recentWorkEl = document.getElementById('recent-work');

  if (!recentWorkEl) {
    return;
  }

  const recentWorkHeader = recentWorkEl.querySelector('.recent-work-header');
  const owner = 'sohel364';
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  try {
    const [reposRes, eventsRes] = await Promise.all([
      fetch(`https://api.github.com/users/${owner}/repos?type=public&per_page=100&sort=pushed`, { headers }),
      fetch(`https://api.github.com/users/${owner}/events/public?per_page=100`, { headers }),
    ]);

    if (!reposRes.ok || !eventsRes.ok) {
      throw new Error(`GitHub API request failed: ${reposRes.status}, ${eventsRes.status}`);
    }

    const [repos, events] = await Promise.all([reposRes.json(), eventsRes.json()]);
    const languages = new Map(repos.map((repo) => [repo.full_name.toLowerCase(), repo.language || 'Public repo']));
    const seenCommits = new Set();
    const recentPushes = events
      .filter((event) => event.type === 'PushEvent' && event.payload?.head)
      .filter((event) => {
        const key = `${event.repo.name.toLowerCase()}:${event.payload.head}`;

        if (seenCommits.has(key)) {
          return false;
        }

        seenCommits.add(key);
        return true;
      })
      .slice(0, 3);

    if (recentPushes.length === 0) {
      const message = document.createElement('p');
      message.textContent = 'No recent public pushes found.';
      recentWorkEl.replaceChildren(recentWorkHeader, message);
      return;
    }

    const commitDetails = await Promise.all(recentPushes.map(async (event) => {
      const commitRes = await fetch(
        `https://api.github.com/repos/${event.repo.name}/commits/${event.payload.head}`,
        { headers },
      );

      if (!commitRes.ok) {
        throw new Error(`GitHub commit request failed: ${commitRes.status}`);
      }

      const commit = await commitRes.json();
      return { event, commit };
    }));

    const commitList = document.createElement('ul');
    commitList.className = 'recent-work-list';

    commitDetails.forEach(({ event, commit }) => {
      const item = document.createElement('li');
      item.className = 'recent-work-item';

      const topline = document.createElement('div');
      topline.className = 'commit-topline';

      const repository = document.createElement('span');
      repository.className = 'commit-repo';
      repository.textContent = event.repo.name;

      const language = document.createElement('span');
      language.className = 'commit-language';
      language.textContent = languages.get(event.repo.name.toLowerCase()) || 'Public repo';
      topline.append(repository, language);

      const title = document.createElement('a');
      title.className = 'commit-title';
      title.href = commit.html_url;
      title.target = '_blank';
      title.rel = 'noreferrer';
      title.textContent = (commit.commit.message || 'Untitled update').split('\n')[0].trim();

      const date = document.createElement('span');
      date.className = 'commit-date';
      date.textContent = new Date(commit.commit.author.date || event.created_at).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });

      const changesLink = document.createElement('a');
      changesLink.className = 'change-link';
      changesLink.href = commit.html_url;
      changesLink.target = '_blank';
      changesLink.rel = 'noreferrer';
      changesLink.textContent = 'View changes';

      item.append(topline, title, date, changesLink);
      commitList.append(item);
    });

    recentWorkEl.replaceChildren(recentWorkHeader, commitList);
  } catch (error) {
    const message = document.createElement('p');
    message.textContent = 'Recent public updates are unavailable right now.';
    recentWorkEl.replaceChildren(recentWorkHeader, message);
  }
}

loadRecentWork();
