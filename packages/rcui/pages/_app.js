import "docs/src/modules/components/bootstrap";
// --- Post bootstrap -----
import React from "react";
import App, { Container } from "next/app";
import find from "lodash/find";
import { Provider } from "react-redux";
import { loadCSS } from "fg-loadcss";
import AppWrapper from "docs/src/modules/components/AppWrapper";
import initRedux from "docs/src/modules/redux/initRedux";
import findPages from /* preval */ "docs/src/modules/utils/findPages";
import PageContext from "docs/src/modules/components/PageContext";
import getPageContext from "docs/src/modules/styles/getPageContext";

let dependenciesLoaded = false;

function loadDependencies() {
  if (dependenciesLoaded) {
    return;
  }

  dependenciesLoaded = true;

  loadCSS(
    "https://fonts.googleapis.com/icon?family=Material+Icons",
    document.querySelector("#material-icon-font")
  );
}

const isBrowser = typeof window !== "undefined";

if (isBrowser) {
  console.log(
    `%c

Tip: you can access the \`theme\` object directly in the console.
`,
    "font-family:monospace;color:#1976d2;font-size:12px;"
  );
}

const pages = [
  {
    ...findPages[0],
    title: "Component Demos"
  },
  {
    pathname: "/",
    displayNav: false,
    title: false
  }
];

function findActivePage(currentPages, router) {
  const activePage = find(currentPages, page => {
    if (page.children) {
      return router.pathname.indexOf(`${page.pathname}/`) === 0;
    }

    // Should be an exact match if no children
    return router.pathname === page.pathname;
  });

  if (!activePage) {
    return null;
  }

  // We need to drill down
  if (activePage.pathname !== router.pathname) {
    return findActivePage(activePage.children, router);
  }

  return activePage;
}

class MyApp extends App {
  constructor(props) {
    super(props);
    this.redux = initRedux(props.reduxServerState || {});
    this.pageContext = getPageContext();
  }

  componentDidMount() {
    loadDependencies();
  }

  render() {
    const { Component, pageProps, router } = this.props;

    let pathname = router.pathname;
    if (pathname !== "/") {
      // The leading / is only added to support static hosting (resolve /index.html).
      // We remove it to normalize the pathname.
      // See `_rewriteUrlForNextExport` on Next.js side.
      pathname = pathname.replace(/\/$/, "");
    }
    const activePage = findActivePage(pages, { ...router, pathname });

    // Add the strict mode back once the number of warnings is manageable.
    // We might miss important warnings by keeping the strict mode 🌊🌊🌊.
    // <React.StrictMode>
    // </React.StrictMode>

    return (
      <Container>
        <Provider store={this.redux}>
          <PageContext.Provider value={{ activePage, pages }}>
            <AppWrapper pageContext={this.pageContext}>
              <Component pageContext={this.pageContext} {...pageProps} />
            </AppWrapper>
          </PageContext.Provider>
        </Provider>
      </Container>
    );
  }
}

MyApp.getInitialProps = () => {
  let pageProps = {};

  if (!process.browser) {
    const redux = initRedux({});
    pageProps = {
      // No need to include other initial Redux state because when it
      // initialises on the client-side it'll create it again anyway
      reduxServerState: redux.getState()
    };
  }

  return {
    pageProps
  };
};

export default MyApp;
