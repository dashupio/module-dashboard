
// import page interface
import { Struct } from '@dashup/module';

/**
 * build address helper
 */
export default class DashboardPage extends Struct {

  /**
   * construct form page
   *
   * @param args 
   */
  constructor(...args) {
    // run super
    super(...args);

    // save field
    this.blockSaveAction = this.blockSaveAction.bind(this);
  }

  /**
   * returns page type
   */
  get type() {
    // return page type label
    return 'dashboard';
  }

  /**
   * returns page type
   */
  get icon() {
    // return page type label
    return 'fad fa-chart-line text-info';
  }

  /**
   * returns page type
   */
  get title() {
    // return page type label
    return 'Dashboard';
  }

  /**
   * returns page data
   */
  get actions() {
    // return page data
    return {
      'block.save' : this.blockSaveAction,
    };
  }

  /**
   * returns object of views
   */
  get views() {
    // return object of views
    return {
      view   : 'page/dashboard',
      config : 'page/dashboard/config',
    };
  }

  /**
   * returns category list for page
   */
  get categories() {
    // return array of categories
    return ['View'];
  }

  /**
   * returns page descripton for list
   */
  get description() {
    // return description string
    return 'Comprehensive charts, reports, and data display';
  }

  /**
   * block save action
   *
   * @param opts 
   * @param block 
   */
  async blockSaveAction(opts, block) {
    // deafen action
    block = await this.dashup.connection.rpc(opts, 'block.save', block);

    // return block
    return block;
  }
}