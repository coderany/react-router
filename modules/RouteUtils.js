import React from 'react'
import warning from 'warning'

function isValidChild(object) {
  return object == null || React.isValidElement(object)
}

export function isReactChildren(object) {
  return isValidChild(object) || (Array.isArray(object) && object.every(isValidChild))
}

function checkPropTypes(componentName, propTypes, props) {
  componentName = componentName || 'UnknownComponent'

  for (const propName in propTypes) {
    if (propTypes.hasOwnProperty(propName)) {
      const error = propTypes[propName](props, propName, componentName)

      /* istanbul ignore if: error logging */
      if (error instanceof Error)
        warning(false, error.message)
    }
  }
}

function createRoute(defaultProps, props) {
  return {...defaultProps, ...props}
}

export function createRouteFromReactElement(element, permalinks) {
  const type = element.type
  const route = createRoute(type.defaultProps, element.props)

  if (type.propTypes)
    checkPropTypes(type.displayName || type.name, type.propTypes, route)

  if (route.children) {
    const childRoutes = createRoutesFromReactChildren(route.children, route, permalinks)

    if (childRoutes.length)
      route.childRoutes = childRoutes

    delete route.children
  }

  return route
}

/**
 * Creates and returns a routes object from the given ReactChildren. JSX
 * provides a convenient way to visualize how routes in the hierarchy are
 * nested.
 *
 *   import { Route, createRoutesFromReactChildren } from 'react-router'
 *
 *   const routes = createRoutesFromReactChildren(
 *     <Route component={App}>
 *       <Route path="home" component={Dashboard}/>
 *       <Route path="news" component={NewsFeed}/>
 *     </Route>
 *   )
 *
 * Note: This method is automatically used when you provide <Route> children
 * to a <Router> component.
 */
export function createRoutesFromReactChildren(children, parentRoute, permalinks) {
  const routes = []

  React.Children.forEach(children, function (element) {
    if (React.isValidElement(element)) {
      // Component classes may have a static create* method.
      if (element.type.createRouteFromReactElement) {
        const route = element.type.createRouteFromReactElement(element, parentRoute)

        if (route) {
          if(element.props.permalink){
            permalinks[route.path] = route
          }else{
            routes.push(route)
          }
        }
      } else {
        const route = createRouteFromReactElement(element, permalinks)

        if(element.props.permalink){
          permalinks[route.path] = route
        }else{
          routes.push(route)
        }
      }
    }
  })

  return routes
}

/**
 * Creates and returns an array of routes from the given object which
 * may be a JSX route, a plain object route, or an array of either.
 */
export function createRoutes(routes) {
  const permalinks = {}
  if (isReactChildren(routes)) {
    routes = createRoutesFromReactChildren(routes, permalinks)
  } else if (routes && !Array.isArray(routes)) {
    routes = [routes]
  }

  routes.permalinks = permalinks
  return routes
}
