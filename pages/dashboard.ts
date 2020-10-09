
// import page interface
import { Struct } from '@dashup/module';

/**
 * build address helper
 */
export default class DashboardPage extends Struct {

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
    return 'fa fa-users';
  }

  /**
   * returns page type
   */
  get title() {
    // return page type label
    return 'Dashboard Page';
  }

  /**
   * returns page data
   */
  get data() {
    // return page data
    return {};
  }

  /**
   * returns object of views
   */
  get views() {
    // return object of views
    return {
      view   : 'page/dashboard/view',
      config : 'page/dashboard/config',
    };
  }

  /**
   * returns category list for page
   */
  get categories() {
    // return array of categories
    return ['frontend'];
  }

  /**
   * returns page descripton for list
   */
  get description() {
    // return description string
    return 'Page Descripton';
  }
}