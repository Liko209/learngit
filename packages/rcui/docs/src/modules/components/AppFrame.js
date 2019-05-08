import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import compose from "recompose/compose";
import NProgress from "nprogress";
import Router from "next/router";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import CssBaseline from "@material-ui/core/CssBaseline";
import MenuIcon from "@material-ui/icons/Menu";
import ColorsIcon from "@material-ui/icons/InvertColors";
import FormatTextdirectionLToR from "@material-ui/icons/FormatTextdirectionLToR";
import FormatTextdirectionRToL from "@material-ui/icons/FormatTextdirectionRToL";
import LightbulbOutlineIcon from "./svgIcons/LightbulbOutline";
import LightbulbFullIcon from "./svgIcons/LightbulbFull";
import NProgressBar from "./NProgressBar";
import GitLabIcon from "./svgIcons/GitLab";
import Link from "./Link";
import AppDrawer from "./AppDrawer";
import AppSearch from "./AppSearch";
import MarkdownLinks from "./MarkdownLinks";
import PageTitle from "./PageTitle";
import { ACTION_TYPES } from "../constants";

Router.onRouteChangeStart = () => {
  NProgress.start();
};

Router.onRouteChangeComplete = () => {
  NProgress.done();
};

Router.onRouteChangeError = () => {
  NProgress.done();
};

const styles = theme => ({
  root: {
    display: "flex"
  },
  grow: {
    flex: "1 1 auto"
  },
  title: {
    marginLeft: 24,
    flex: "0 1 auto"
  },
  appBar: {
    transition: theme.transitions.create("width"),
    "@media print": {
      position: "absolute"
    }
  },
  appBarHome: {
    boxShadow: "none"
  },
  appBarShift: {
    [theme.breakpoints.up("lg")]: {
      width: "calc(100% - 240px)"
    }
  },
  drawer: {
    [theme.breakpoints.up("lg")]: {
      width: 240
    }
  },
  navIconHide: {
    [theme.breakpoints.up("lg")]: {
      display: "none"
    }
  }
});

class AppFrame extends React.Component {
  state = {
    mobileOpen: false
  };

  handleDrawerOpen = () => {
    this.setState({ mobileOpen: true });
  };

  handleDrawerClose = () => {
    this.setState({ mobileOpen: false });
  };

  handleTogglePaletteType = () => {
    const paletteType =
      this.props.reduxTheme.paletteType === "light" ? "dark" : "light";
    document.cookie = `paletteType=${paletteType};path=/;max-age=31536000`;

    this.props.dispatch({
      type: ACTION_TYPES.THEME_CHANGE,
      payload: {
        paletteType
      }
    });
  };

  handleToggleDirection = () => {
    this.props.dispatch({
      type: ACTION_TYPES.THEME_CHANGE,
      payload: {
        direction: this.props.reduxTheme.direction === "ltr" ? "rtl" : "ltr"
      }
    });
  };

  render() {
    const { children, classes, reduxTheme } = this.props;

    return (
      <PageTitle>
        {title => {
          let disablePermanent = false;
          let navIconClassName = "";
          let appBarClassName = classes.appBar;

          if (title === null) {
            // home route, don't shift app bar or dock drawer
            disablePermanent = true;
            appBarClassName += ` ${classes.appBarHome}`;
          } else {
            navIconClassName = classes.navIconHide;
            appBarClassName += ` ${classes.appBarShift}`;
          }

          return (
            <div className={classes.root}>
              <NProgressBar />
              <CssBaseline />
              <MarkdownLinks />
              <AppBar className={appBarClassName}>
                <Toolbar>
                  <IconButton
                    color="inherit"
                    aria-label="Open drawer"
                    onClick={this.handleDrawerOpen}
                    className={navIconClassName}
                  >
                    <MenuIcon />
                  </IconButton>
                  {title !== null && (
                    <Typography
                      className={classes.title}
                      variant="h6"
                      color="inherit"
                      noWrap
                    >
                      {title}
                    </Typography>
                  )}
                  <div className={classes.grow} />
                  <AppSearch />
                  <Tooltip title="Edit docs colors" enterDelay={300}>
                    <IconButton
                      color="inherit"
                      aria-label="Edit docs colors"
                      component={Link}
                      naked
                      href="/style/color/#color-tool"
                      data-ga-event-category="AppBar"
                      data-ga-event-action="colors"
                    >
                      <ColorsIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Toggle light/dark theme" enterDelay={300}>
                    <IconButton
                      color="inherit"
                      onClick={this.handleTogglePaletteType}
                      aria-label="Toggle light/dark theme"
                      data-ga-event-category="AppBar"
                      data-ga-event-action="dark"
                    >
                      {reduxTheme.paletteType === "light" ? (
                        <LightbulbOutlineIcon />
                      ) : (
                        <LightbulbFullIcon />
                      )}
                    </IconButton>
                  </Tooltip>
                  <Tooltip
                    title="Toggle right-to-left/left-to-right"
                    enterDelay={300}
                  >
                    <IconButton
                      color="inherit"
                      onClick={this.handleToggleDirection}
                      aria-label="Toggle right-to-left/left-to-right"
                      data-ga-event-category="AppBar"
                      data-ga-event-action="rtl"
                    >
                      {reduxTheme.direction === "rtl" ? (
                        <FormatTextdirectionLToR />
                      ) : (
                        <FormatTextdirectionRToL />
                      )}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="GitLab repository" enterDelay={300}>
                    <IconButton
                      component="a"
                      color="inherit"
                      href="https://git.ringcentral.com/RCUI/rcui"
                      aria-label="GitLab repository"
                      data-ga-event-category="AppBar"
                      data-ga-event-action="gitlab"
                    >
                      <GitLabIcon />
                    </IconButton>
                  </Tooltip>
                </Toolbar>
              </AppBar>
              <AppDrawer
                className={classes.drawer}
                disablePermanent={disablePermanent}
                onClose={this.handleDrawerClose}
                onOpen={this.handleDrawerOpen}
                mobileOpen={this.state.mobileOpen}
              />
              {children}
            </div>
          );
        }}
      </PageTitle>
    );
  }
}

AppFrame.propTypes = {
  children: PropTypes.node.isRequired,
  classes: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  reduxTheme: PropTypes.object.isRequired
};

export default compose(
  connect(state => ({
    reduxTheme: state.theme
  })),
  withStyles(styles)
)(AppFrame);
