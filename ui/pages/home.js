const menu = require('../components/menu');

module.exports = function (app, html) {
  function authBox () {
    return html`
      <section>
        <h1>Welcome</h1>
        <div>
          You are not logged in.
        </div>
      </section>
    `;
  }

  function userBox () {
    if (!app.state.user) {
      return;
    }

    return html`
      <section>
        <h1>Your Account</h1>
        <p>You are logged in as <strong>${app.state.user.email}</strong></p>
      </section>
    `;
  }

  return {
    view: () => html`
      <main>
        ${menu(app, html)}
  
        ${app.state.loggedIn ? userBox() : authBox()}
      </main>
    `
  };
};
