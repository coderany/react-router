'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

import createHashHistory from 'history/lib/createHashHistory';
import useQueries from 'history/lib/useQueries';
import React from 'react';

import createTransitionManager from './createTransitionManager';
import { routes } from './PropTypes';
import RouterContext from './RouterContext';
import { createRoutes } from './RouteUtils';
import { createRouterObject, createRoutingHistory } from './RouterUtils';
import warning from './warning';

function isDeprecatedHistory(history) {
  return !history || !history.__v2_compatible__;
}

var _React$PropTypes = React.PropTypes;
var func = _React$PropTypes.func;
var object = _React$PropTypes.object;

/**
 * A <Router> is a high-level API for automatically setting up
 * a router that renders a <RouterContext> with all the props
 * it needs each time the URL changes.
 */
var Router = React.createClass({
  displayName: 'Router',

  propTypes: {
    history: object,
    children: routes,
    routes: routes, // alias for children
    render: func,
    createElement: func,
    onError: func,
    onUpdate: func
  },

  getDefaultProps: function getDefaultProps() {
    return {
      render: function render(props) {
        return React.createElement(RouterContext, props);
      }
    };
  },

  getInitialState: function getInitialState() {
    return {
      location: null,
      routes: null,
      params: null,
      components: null
    };
  },

  handleError: function handleError(error) {
    if (this.props.onError) {
      this.props.onError.call(this, error);
    } else {
      // Throw errors by default so we don't silently swallow them!
      throw error; // This error probably occurred in getChildRoutes or getComponents.
    }
  },

  componentWillMount: function componentWillMount() {
    var _this = this;

    var history = this.props.history;
    var _props = this.props;
    var routes = _props.routes;
    var children = _props.children;
    var _props2 = this.props;
    var parseQueryString = _props2.parseQueryString;
    var stringifyQuery = _props2.stringifyQuery;

    process.env.NODE_ENV !== 'production' ? warning(!(parseQueryString || stringifyQuery), '`parseQueryString` and `stringifyQuery` are deprecated. Please create a custom history. http://tiny.cc/router-customquerystring') : undefined;

    if (isDeprecatedHistory(history)) {
      history = this.wrapDeprecatedHistory(history);
    }

    var transitionManager = createTransitionManager(history, createRoutes(routes || children));
    this._unlisten = transitionManager.listen(function (error, state) {
      if (error) {
        _this.handleError(error);
      } else {
        _this.setState(state, _this.props.onUpdate);
      }
    });

    this.router = createRouterObject(history, transitionManager);
    this.history = createRoutingHistory(history, transitionManager);
  },

  wrapDeprecatedHistory: function wrapDeprecatedHistory(history) {
    var _props3 = this.props;
    var parseQueryString = _props3.parseQueryString;
    var stringifyQuery = _props3.stringifyQuery;

    var createHistory = undefined;
    if (history) {
      process.env.NODE_ENV !== 'production' ? warning(false, 'It appears you have provided a deprecated history object to `<Router/>`, please use a history provided by ' + 'React Router with `import { browserHistory } from \'react-router\'` or `import { hashHistory } from \'react-router\'`. ' + 'If you are using a valid custom history please set `history.__v2_compatible__ = true`. http://tiny.cc/router-usinghistory') : undefined;
      createHistory = function () {
        return history;
      };
    } else {
      process.env.NODE_ENV !== 'production' ? warning(false, '`Router` no longer defaults the history prop to hash history. Please use the `hashHistory` singleton instead. http://tiny.cc/router-defaulthistory') : undefined;
      createHistory = createHashHistory;
    }

    return useQueries(createHistory)({ parseQueryString: parseQueryString, stringifyQuery: stringifyQuery });
  },

  /* istanbul ignore next: sanity check */
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    process.env.NODE_ENV !== 'production' ? warning(nextProps.history === this.props.history, 'You cannot change <Router history>; it will be ignored') : undefined;

    process.env.NODE_ENV !== 'production' ? warning((nextProps.routes || nextProps.children) === (this.props.routes || this.props.children), 'You cannot change <Router routes>; it will be ignored') : undefined;
  },

  componentWillUnmount: function componentWillUnmount() {
    if (this._unlisten) this._unlisten();
  },

  render: function render() {
    var _state = this.state;
    var location = _state.location;
    var routes = _state.routes;
    var params = _state.params;
    var components = _state.components;
    var _props4 = this.props;
    var createElement = _props4.createElement;
    var render = _props4.render;

    var props = _objectWithoutProperties(_props4, ['createElement', 'render']);

    if (location == null) return null; // Async match

    // Only forward non-Router-specific props to routing context, as those are
    // the only ones that might be custom routing context props.
    Object.keys(Router.propTypes).forEach(function (propType) {
      return delete props[propType];
    });

    return render(_extends({}, props, {
      history: this.history,
      router: this.router,
      location: location,
      routes: routes,
      params: params,
      components: components,
      createElement: createElement
    }));
  }

});

export default Router;