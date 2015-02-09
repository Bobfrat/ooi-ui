"use strict";
/*
 * ooiui/static/js/views/common/TOCView.js
 * View definitions to build the table of contents
 *
 * Dependencies
 * Libs
 * - ooiui/static/lib/underscore/underscore.js
 * - ooiui/static/lib/backbone/backbone.js
 * - ooiui/static/js/ooi.js
 */


var TOCView = Backbone.View.extend({
  add: function(arrayModel){
    var subview = new ArrayItemView({
      model: arrayModel
    });
    this.subviews.push(subview);
    this.$el.find('ul').append(subview.el);
  },
  initialize: function(){
    _.bindAll(this, "render", "add");
    this.subviews = [];
    this.listenTo(this.collection, "reset", this.render);
  },
  template: JST['ooiui/static/js/partials/TOC.html'],
  render: function(){
    var self = this;
    this.$el.html(this.template());
    this.collection.each(function(arrayModel){
      self.add(arrayModel);
    });
  }
});

//--------------------------------------------------------------------------------
//  NestedItemView
//--------------------------------------------------------------------------------

var NestedItemView = Backbone.View.extend({
  level: 2,
  add: function(subview) {
    this.subviews.push(subview);
    this.$el.append(subview.el);
  },
  tagName: 'ul',
  className: 'nav',
  toggle: function() {
    this.$el.collapse('toggle');
  },
  initialize: function(options) {
    if(options && options.level) {
      this.level = options.level;
    }
    this.subviews = [];
    this.render();
  },
  render: function(){
    if(this.level == 2) {
      this.$el.toggleClass('sidebar-nav-second-level');
    } else if(this.level == 3) {
      this.$el.toggleClass('sidebar-nav-third-level');
    } else if(this.level == 4) {
      this.$el.toggleClass('sidebar-nav-third-level');
    }
    this.$el.collapse('show');
  }
});

//--------------------------------------------------------------------------------
//  ArrayItemView
//--------------------------------------------------------------------------------

var ArrayItemView = Backbone.View.extend({
  add: function(platformModel){
    var subview = new PlatformDeploymentItemView({
      model: platformModel
    });
    this.nestedView.add(subview);
  },
  events: {
    'click a' : 'onClick' 
  },
  tagName: 'li',
  initialize: function() {
    this.nestedView = new NestedItemView();
    this.model.set('reference_designator', this.model.get('array_code'));
    this.render();
  },
  onClick: function(e) {
    var self = this;
    e.stopPropagation();
    // this is the model that collects the geo_location 
    // Map listens to the change then changes the location
    // there are multiple models commented out. Checking for location errors
   // console.log(this.model.get('geo_location'))
    //var loc = this.model.get('geo_location')
    //console.log(loc.coordinates[0][0])
    //loc = loc.coordinates[0][0]
    //console.log(ooi.mapModel)
    //ooi.mapModel.set({mapCenter: loc})
    if(this.model.platformDeployments.length == 0) {
      this.model.platformDeployments.fetch({
        success: function(collection, response, options) {
          self.renderPlatforms();
        },
        reset: true
      });
    } else {
      this.nestedView.toggle();
    }
    ooi.trigger('arrayItemView:arraySelect', this.model);
  },
  template: JST['ooiui/static/js/partials/ArrayItem.html'],
  render: function(){
    var self = this;
    this.$el.html(this.template({data: this.model}));
  },
  renderPlatforms: function() {
    var self = this;
    this.model.platformDeployments.each(function(platformModel){
      self.add(platformModel);
    });
    this.$el.append(this.nestedView.el);
  },
});

//--------------------------------------------------------------------------------
//  PlatformDeploymentItemView
//--------------------------------------------------------------------------------

var PlatformDeploymentItemView = Backbone.View.extend({
  tagName:'li',
  add: function(instrumentModel) {
    var subview = new InstrumentDeploymentItemView({
      model: instrumentModel
    });
    this.nestedView.add(subview);
  },
  events: {
    'click a' : 'onClick' 
  },
  initialize: function(){
    _.bindAll(this, "render", "onClick");
    this.nestedView = new NestedItemView({
      level: 3
    });
    this.modifyDisplayName();
    this.render();
  },
  onClick: function(e) {
    var self = this;
    console.log(this.model)
    e.stopPropagation();
    if(this.model.instrumentDeployments.length == 0) {
      this.model.instrumentDeployments.fetch({
        success: function(collection, response, options) {
          self.renderInstruments();
        },
        reset: true
      });
    } else {
      this.nestedView.toggle();
    }
    ooi.trigger('platformDeploymentItemView:platformSelect', this.model);
    console.log(this.model)
    var loc = this.model.get('geo_location')
    console.log(loc.coordinates)
    loc = loc.coordinates
    //console.log(ooi.mapModel)
    ooi.mapModel.set({mapCenter: loc})
  
  },
  modifyDisplayName: function() {
    var display_name = this.model.get('display_name') || "";
    if(display_name.indexOf('-') >= 0) {
      var items = display_name.split(' - ');
      this.model.set('display_name', items[items.length - 1]);
    } else {
      this.$el.toggleClass('parent-platform');
    }
  },
  template: JST['ooiui/static/js/partials/ArrayItem.html'],
  render: function(){
    var self = this;
    this.$el.html(this.template({data: this.model}));
  },
  renderInstruments: function() {
    var self = this;
    this.model.instrumentDeployments.each(function(instrumentModel) {
      self.add(instrumentModel);
    });
    this.$el.append(this.nestedView.el);
  }
});

//--------------------------------------------------------------------------------
//  InstrumentDeploymentItemView
//--------------------------------------------------------------------------------

var InstrumentDeploymentItemView = Backbone.View.extend({
  events: {
    'click a' : 'onClick'
  },
  add: function(streamModel) {
    var subview = new StreamItemView({
      model: streamModel
    });
    this.nestedView.add(subview);
  },
  tagName: 'li',
  initialize: function() {
    this.nestedView = new NestedItemView({
      level: 4
    });
    this.streams = new StreamCollection();
    this.render();
  },
  onClick: function(e) {
    var self = this;
    e.stopPropagation();
    if(this.streams.length == 0) {
      this.streams.fetch({
        data: $.param({reference_designator: this.model.get('reference_designator')}),
        success: function(collection, response, options) {
          self.renderStreams();
        },
        reset: true
      });
    }
    ooi.trigger('instrumentDeploymentItemView:instrumentSelect', this.model);
  },
  template: JST['ooiui/static/js/partials/ArrayItem.html'],
  render: function() {
    var self = this;
    this.$el.html(this.template({data: this.model}));
  },
  renderStreams: function() {
    var self = this;
    this.streams.each(function(streamModel) {
      self.add(streamModel);
    });
    this.$el.append(this.nestedView.el);
  }
});

var StreamItemView = Backbone.View.extend({
  tagName: 'li',
  className: 'stream-item',
  events: {
    'click a' : 'onClick'
  },
  initialize: function() {
    this.render();
  },
  onClick: function(e) {
    e.stopPropagation();
    ooi.trigger('streamItemView:streamSelect', this.model);
  },
  template: JST['ooiui/static/js/partials/StreamItem.html'],
  render: function() {
    var self = this;
    this.$el.html(this.template({data: this.model}));
  }
});
