;(function () {
  if (typeof window.ArcaneJS === undefined) {
    var ArcaneJS = window.ArcaneJS = {};
  }


  var escapeSlash ={
    re: /(\/)/g,
    with: "\\/"
  }
  var escapeParams = {
    re: /(:\w*)/g,
    with: "(\\w*)"
  }

  var captureParams = /:(\w*)/g


  var RouteMaster =  {
    nextId: 0
  };

  RouteMaster.routers = [];


  RouteMaster.onHashChange = function(event) {
    var hash = window.location.hash;
    this.triggerRouters(hash);
  }

  RouteMaster.addRouter = function(router) {
    this.routers.push(router);
    this.nextId++;
  }

  RouteMaster.triggerRouters = function(url) {
    var match
    this.routers.forEach(function(router) {
      match = router.firstMatchingRoute(url);
      if (match) {
        match.execute(url);
      }
    })
  }



  window.onhashchange = RouteMaster.onHashChange.bind(RouteMaster);

  Route = function(string, callback) {
    this.base = string;
    this.re = this.convert(string);
    this.paramsArr = this.identifyParams(string);
    this.callback = callback;
  }

  Route.prototype.convert = function(string) {
    string = string.replace(escapeSlash.re, escapeSlash.with);
    string = string.replace(escapeParams.re, escapeParams.with);
    return new RegExp(string);
  }

  Route.prototype.identifyParams = function(string) {
    var paramsArray= [];
    var matches = string.match(captureParams);
    matches.forEach(function(match) {
      paramsArray.push(match.slice(1, match.length));
    });
    return paramsArray;
  }

  Route.prototype.createParamsObject = function(url) {
    var params = {};
    matches = url.match(this.re);
    this.paramsArr.forEach(function(param, idx) {
      params[param] =  matches[idx + 1];
    })
    return params;
  }

  Route.prototype.matches = function(url) {
    return url.search(this.re) > -1;
  }


// Executes the callback of the url, passing the params object as the first argument
  Route.prototype.execute = function(url) {
    if (!this.matches(url)) {
      console.error("Route doesn't match");
      return;
    }
    var params = this.createParamsObject(url);
    this.callback(params);
  }


  //Routers

  var Router = ArcaneRouter = function($el) {
    this.$el = $el;
    this.routes = [];
    this.nextId = 0;
    this.id = RouteMaster.nextId;
    RouteMaster.addRouter(this);
  }

  Router.prototype.addRoute = function(url, callback) {
    this.nextId += 1;
    var route = new Route(url, callback, this.nextId);
    this.routes.push(route);
    return route;

  }

  Router.prototype.firstMatchingRoute = function(url) {
    var route;
    for (var idx = 0; idx < this.routes.length; idx++) {
      route = this.routes[idx];
      if (route.matches(url)) {
        return route;
      }
    }
    return undefined;
  }


  Router.prototype.when = function(url, config) {
    // current template is the only one supported
    if (typeof url !== "string") {
      console.error("Router must take a string");
    }

    this.addRoute(url, function(params) {
      config.$el = this.$el;
      config.params = params;
      if (this.view) {
        this.view.stopListening();
      }
      this.view = new config.view(config);
      this.view.on("click", "main", function() {console.log("WHAT")});
      this.view._render();
    }.bind(this))

    return this;
  }






}());