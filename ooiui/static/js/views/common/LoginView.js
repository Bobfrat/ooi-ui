"use strict";
/*
 * ooiui/static/js/views/common/LoginView.js
 * Model definitions for Arrays
 *
 * Dependencies
 * Partials
 * - ooiui/static/js/partials/LoginForm.html
 * Libs
 * - ooiui/static/lib/underscore/underscore.js
 * - ooiui/static/lib/backbone/backbone.js
 * - ooiui/static/js/ooi.js
 * Usage
 */


var LoginView = Backbone.View.extend({
  events: {
    'click #btnLogin' : "login",
    'keyup #passInput' : "keyUp",
    'click #btnClose' : "closeBtn",
    'keypress #passInput' : 'keyPress',
    'hidden.bs.modal' : 'hidden'
  },
  initialize: function(params) {
    _.bindAll(this, "render", "login", "show", "hide", "keyPress");
    if(!params) {
      params = {}
    }
    /* Gives us the ability to specify successful behavior after logging in */
    /* bind this.success = params.success */
    if(typeof params.success === "function") {
      this.success = params.success.bind(this);
    }
    if(typeof params.failure === "function") {
      console.log("failure defined");
      this.failure = params.failure.bind(this);
    }
    if(typeof params.hidden === "function") {
      console.log("hidden defined");
      this.hidden = params.hidden.bind(this);
    }
    // We want to look at the cookies for the token
    this.model.fetch();
    if(this.model.get('token') == "") {
      // Need to prompt for login since we don't have a current token
      this.render();
    } else {
      this.success();
    }
    this.attempts = 0; // Keep track of attempts
    this.isHidden = false; // Initially keep retrying
    this.attemptsTotal = 3;
  },
  login: function(e) {
    var self = this;
    e.preventDefault();
    this.model.set({
      login: this.$el.find('#usrInput').val(),
      password: this.$el.find('#passInput').val()
    });

    this.model.logIn();
    console.log(this);
    // If login was successful and we have a token
    if(this.model.get('token') != '') {
      console.log("success");
      this.hide();
      this.success();
      window.location.reload();
    } else {
      console.log("no bueno amigo");
      this.attempts++;
      this.attemptsRemaining = this.attemptsTotal - this.attempts;
      this.$el.find('.lgn-message').html('Username or Password are incorrect').fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
      // this.$el.find('.lgn-warning').html('Failed attempts = '+this.attempts);
      // this.$el.find('.lgn-warning').html('You have '+this.attemptsRemaining+' attempts remaining.');
      this.failure();

      if(this.attemptsRemaining === 2) {
        this.$el.find('#lgn-modal').css('border-color', 'rgba(194, 0, 0, 0.2)');
      }      
      if(this.attemptsRemaining === 1) {
        this.$el.find('#lgn-modal').css('border-color', 'rgba(194, 0, 0, 0.69)');
      }
      if(this.attemptsRemaining === 0) {
        this.$el.find('#lgn-modal').css('border-color', 'rgb(228, 1, 1)');        
       //>>--locks out contols --> 
        // this.$el.find('#btnLogin').prop('disabled', true);
        // this.$el.find('#usrInput').prop('disabled', true);
        // this.$el.find('#passInput').prop('disabled', true);
        // this.$el.find('.lgn-message').html('You have exceeded your password attempts.');
        // this.$el.find('.lgn-warning').html('');        
      }
    }
  }, 
  hidden: function(e) {
    console.log("hidden");
  },
    /* Called when the user is successfully authenticated */
  success: function() {
    console.log("Success"); 
  },
  failure: function() {
    console.log("this failure");
  },
  show: function() {
    if(this.attempts >= 1) {
      this.$el.find('.lgn-message').html('Username or Password are incorrect');
    }
    $('#loginModal').on('shown.bs.modal',function(){$('#usrInput').focus();});
    $('#loginModal').modal('show');
    return this;
  },
  hide: function() {
    console.log("hide was called");
    this.isHidden = true;
    $('#loginModal').modal('hide');
    return this;
  },
  keyUp: function(e) {
    if($(e.target).val() == '') {
      //If there is no text within the input then disable the button
      this.$el.find('.enableOnInput').prop('disabled', true);
    } else {
      //If there is text in the input, then enable the button
      this.$el.find('.enableOnInput').prop('disabled', false);
      console.log("disabledAttempts  " +this.attempts);
    }
  },
  closeBtn: function(e) {
    this.initialize(); 
  },
  keyPress: function(e) {
    if(e.which == 13) {
      console.log(this);
      this.login(e);
    }
  },
  template: JST["ooiui/static/js/partials/LoginForm.html"],
  render: function() {
    this.$el.html(this.template({}));
  }
});
