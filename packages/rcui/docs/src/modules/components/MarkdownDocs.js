import React from "react";
import PropTypes from "prop-types";
import warning from "warning";
import { connect } from "react-redux";
import compose from "recompose/compose";
import { withStyles } from "@material-ui/core/styles";
import MarkdownElement from "./MarkdownElement";
import Head from "./Head";
import AppContent from "./AppContent";
import Demo from "./Demo";
import AppFrame from "./AppFrame";
import AppTableOfContents from "./AppTableOfContents";
import EditPage from "./EditPage";
import MarkdownDocsContents from "./MarkdownDocsContents";
import {
  getHeaders,
  getTitle,
  getDescription,
  demoRegexp
} from "../utils/parseMarkdown";
import { LANGUAGES } from "../constants";

const styles = theme => ({
  root: {
    marginBottom: 100
  },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end"
  },
  markdownElement: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
    padding: `0 ${theme.spacing.unit}px`
  }
});

const SOURCE_CODE_ROOT_URL =
  "https://git.ringcentral.com/RCUI/rcui/tree/master";

function MarkdownDocs(props) {
  const {
    classes,
    markdown: markdownProp,
    markdownLocation: markdownLocationProp,
    req,
    reqPrefix,
    reqSource
  } = props;

  let demos;
  let markdown = markdownProp;

  if (req) {
    demos = {};
    const markdowns = {};
    const sourceFiles = reqSource.keys();
    req.keys().forEach(filename => {
      if (filename.indexOf(".md") !== -1) {
        const match = filename.match(/-([a-z]{2})\.md$/);

        if (match && LANGUAGES.indexOf(match[1]) !== -1) {
          markdowns[match[1]] = req(filename);
        } else {
          markdowns.en = req(filename);
        }
      } else {
        const demoName = `${reqPrefix}/${filename.replace(/.\/|.hooks/g, "")}`;
        const isHooks = filename.indexOf(".hooks.js") !== -1;
        const jsType = isHooks ? "jsHooks" : "js";
        const rawType = isHooks ? "rawHooks" : "raw";

        const tsFilename = !isHooks
          ? sourceFiles.find(sourceFileName => {
              const isTSSourceFile = /\.tsx$/.test(sourceFileName);
              const isTSVersionOfFile =
                sourceFileName.replace(/\.tsx$/, ".js") === filename;
              return isTSSourceFile && isTSVersionOfFile;
            })
          : undefined;

        demos[demoName] = {
          ...demos[demoName],
          [jsType]: req(filename).default,
          [rawType]: reqSource(filename),
          rawTS: tsFilename ? reqSource(tsFilename) : undefined
        };
      }
    });
    markdown = markdowns.en;
  }

  const headers = getHeaders(markdown);

  return (
    <MarkdownDocsContents
      markdown={markdown}
      markdownLocation={markdownLocationProp}
    >
      {({ contents, markdownLocation }) => (
        <AppFrame>
          <Head
            title={`${headers.title || getTitle(markdown)} - Material-UI`}
            description={headers.description || getDescription(markdown)}
          />
          <AppTableOfContents contents={contents} />
          <AppContent className={classes.root}>
            <div className={classes.header}>
              <EditPage
                markdownLocation={markdownLocation}
                sourceCodeRootUrl={SOURCE_CODE_ROOT_URL}
              />
            </div>
            {contents.map(content => {
              if (demos && demoRegexp.test(content)) {
                let demoOptions;
                try {
                  demoOptions = JSON.parse(`{${content}}`);
                } catch (err) {
                  console.error(err); // eslint-disable-line no-console
                  return null;
                }

                const name = demoOptions.demo;
                if (!demos || !demos[name]) {
                  const errorMessage = [
                    `Missing demo: ${name}. You can use one of the following:`,
                    Object.keys(demos)
                  ].join("\n");

                  throw new Error(errorMessage);
                }

                return (
                  <Demo
                    key={content}
                    demo={demos[name]}
                    demoOptions={demoOptions}
                    githubLocation={`${SOURCE_CODE_ROOT_URL}/docs/src/${name}`}
                  />
                );
              }

              return (
                <MarkdownElement
                  className={classes.markdownElement}
                  key={content}
                  text={content}
                />
              );
            })}
          </AppContent>
        </AppFrame>
      )}
    </MarkdownDocsContents>
  );
}

MarkdownDocs.propTypes = {
  classes: PropTypes.object.isRequired,
  markdown: PropTypes.string,
  // You can define the direction location of the markdown file.
  // Otherwise, we try to determine it with an heuristic.
  markdownLocation: PropTypes.string,
  req: PropTypes.func,
  reqPrefix: PropTypes.string,
  reqSource: PropTypes.func
};

export default compose(withStyles(styles))(MarkdownDocs);
