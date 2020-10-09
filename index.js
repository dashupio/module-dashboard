// require first
const { Module } = require('@dashup/module');

// import base
const DashboardPage = require('./pages/dashboard');

/**
 * export module
 */
class DashboardModule extends Module {

  /**
   * construct discord module
   */
  constructor() {
    // run super
    super();
  }
  
  /**
   * registers dashup structs
   *
   * @param {*} register 
   */
  register(fn) {
    // register pages
    fn('page', DashboardPage);
  }
}

// create new
module.exports = new DashboardModule();
