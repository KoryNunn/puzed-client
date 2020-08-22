const setPath = require('spath/setPath');

const {
  createForm,
  createTextInput,
  createSelectInput
} = require('minthril-form');

const menu = require('../components/menu');

function selectRepository (app, html) {
  return html`
    <main oncreate=${app.listRepositories.bind(null, app)}>
      ${menu(app, html)}
 
      <section>
        <h2>Your Repositories</h2>
        <p>Select a repository you would like to deploy.</p>
        <div class="loading" ${app.state.loading === 0 ? 'off' : ''}><div>Loading your repositories</div></div>
        <ul>
          ${(app.state.repositories || []).map(repository => {
            return html`
              <li>
                <a href="/projects/create?from=${repository.full_name}">${repository.name}</a>
              </li>`;
          })}
        </ul>
      </section>
    </main>
  `;
}

function setupProject (app, html, url) {
  const from = url.searchParams.get('from').split('/');
  const owner = from[0];
  const repo = from[1];

  const form = createForm({
    fields: [
      {
        name: 'name',
        label: 'Project Name',
        component: createTextInput,
        autoFocus: true,
        initialValue: `my-${owner}-${repo}-1`
      },
      {
        name: 'image',
        label: 'Image',
        component: createSelectInput,
        options: [
          {
            value: 'nodejs12',
            label: 'NodeJS (version 12)'
          }
        ],
        initialValue: 'nodejs12'
      },
      {
        name: 'webPort',
        label: 'Web Port',
        component: createTextInput,
        initialValue: '8000'
      },
      {
        name: 'domain',
        label: 'Domain',
        component: createTextInput,
        initialValue: `${owner}-${repo}.puzed.net`
      }
    ],
    onSubmit: (event, data) => {
      event.preventDefault();

      app.createProject(app, {
        image: data.image,
        domain: data.domain,
        name: data.name,
        owner,
        repo,
        webport: data.webPort
      }).then(project => {
        setPath('/projects/' + project.id);
      });
    }
  });

  return html`
    <main>
      ${menu(app, html)}

      <section>
        <h2>Create a new project</h2>
        ${form}
      </section>
    </main>
  `;
}

module.exports = function (app, html) {
  const url = new URL(window.location.href);

  if (url.searchParams.get('from')) {
    return setupProject(app, html, url);
  }

  return selectRepository(app, html);
};
