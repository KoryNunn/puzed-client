const mithril = require('mithril');

const instanceItem = require('./instanceItem');

function instanceList () {
  return {
    oncreate: (vnode) => {
      const { app, service, deployment } = vnode.attrs;
      app.listInstances(app, service.id, deployment.id);
    },

    view: (vnode) => {
      const { app, service, deployment } = vnode.attrs;
      const instances = app.state.instances.filter(instance => instance.deploymentId === deployment.id);

      return instances.map(instance => {
        return mithril(instanceItem, { key: instance.id, app, service, deployment, instance });
      });
    }
  };
}

module.exports = instanceList;
