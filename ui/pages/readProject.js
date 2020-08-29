const menu = require('../components/menu');
const createTerminal = require('../components/terminal');
const createTabbed = require('../components/tabbed');

const format = require('date-fns/format');

const toggleExpanded = parentSelector => event => {
  const parent = event.target.closest(parentSelector);
  if (parent.classList.contains('expanded')) {
    parent.classList.remove('expanded');
  } else {
    parent.classList.add('expanded');
  }
};

module.exports = function (app, html) {
  const project = app.state.projects.find(project => project.id === app.state.tokens.projectId);
  const deployments = app.state.deployments.filter(deployment => deployment.projectid === app.state.tokens.projectId);

  function handleCreation () {
    app.readProject(app, app.state.tokens.projectId);
    app.listDeployments(app, app.state.tokens.projectId);
  }

  function renderDeployments () {
    return html`
      <puz-deployments>
        <div class="heading-container">
          <h2>
            Deployments
          </h3>
          <div>
            <button>Scale Up</button>
          </div>
        </div>
        ${deployments.map((deployment, deploymentIndex) => html`
          <puz-deployment key=${deployment.id} class="deployment-status-${deployment.status} ${deploymentIndex === 0 ? 'expanded' : ''}">
            <puz-deployment-heading onclick=${toggleExpanded('puz-deployment')}>
              <div class="nowrap cutoff">${deployment.id}</div>
              <div><span class="label label-${deployment.status}">${deployment.status}</span></div>
              <div class="nowrap">${format(new Date(parseFloat(deployment.datecreated)), 'dd/MM/yyyy hh:mm:ss')}</div>
            </puz-deployment-heading>

            <puz-deployment-content>
              ${createTabbed(app, html, {
                tabs: [{
                  key: 'buildLogs',
                  title: html`<span>Build Log</span>`,
                  content: () => html`
                    <puz-build-log>
                      ${createTerminal(app.state.buildLogs[deployment.id] || deployment.buildlog || 'No build log found')}
                    </puz-build-log>
                  `
                }, {
                  key: 'logs',
                  title: html`<span>Logs</span>`,
                  defaultActive: true,
                  content: () => {
                    const reconnect = event => {
                      event.preventDefault();
                      app.startDeploymentLogs(app, project.id, deployment.id);
                    }

                    return html`
                    <puz-live-log oncreate=${app.startDeploymentLogs.bind(null, app, project.id, deployment.id)} onremove=${app.stopDeploymentLogs.bind(null, app, project.id, deployment.id)}>
                      ${app.state.liveLogs[deployment.id] && !app.state.liveLogs[deployment.id].response ? html`
                        <div class="alert alert-warning">
                          Logs are not live. Disconnected.
                          <a href="javascript:void(0)" onclick=${reconnect}>Click here to reconnect</a>
                        </div>
                      ` : ''}
                      ${createTerminal(app.state.liveLogs[deployment.id] && app.state.liveLogs[deployment.id].data || 'No logs found')}
                    </puz-live-log>
                  `
                  }
                }]
              })}
            </puz-deployment-content>
          </puz-deployment>
        `)}
      </puz-deployments>
    `;
  }

  function renderProject () {
    return html`
      <div>
        <h1>${project.name}</h2>
        <div>
          <strong>Domain:</strong> <a href="https://${project.domain}" target="_blank">https://${project.domain}</a>
        </div>

        <div>
          <strong>Web Port:</strong> ${project.webport}
        </div>

        <div>
          <strong>Repository:</strong> <a href="https://github.com/${project.owner}/${project.repo}" target="_blank">https://github.com/${project.owner}/${project.repo}</a>
        </div>

        ${deployments.length > 0 ? renderDeployments() : null}
      </div>
    `;
  }

  return html`
    <main oncreate=${handleCreation}>
      ${menu(app, html)}

      <section>
        <div class="loading" ${app.state.loading === 0 ? 'off' : ''}><div>Loading project</div></div>

        ${project ? renderProject() : null}
      </section>
    </main>
  `;
};
