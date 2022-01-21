
// import page interface
import { Struct } from '@dashup/module';

/**
 * build address helper
 */
export default class ChartBlock extends Struct {

  /**
   * returns page type
   */
  get type() {
    // return page type label
    return 'chart';
  }

  /**
   * returns page type
   */
  get icon() {
    // return page type label
    return 'fad fa-chart-line';
  }

  /**
   * returns page type
   */
  get title() {
    // return page type label
    return 'Chart';
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
      view   : 'block/chart',
      config : 'block/chart/config',
    };
  }

  /**
   * returns category list for page
   */
  get categories() {
    // return array of categories
    return ['phone', 'website', 'dashboard'];
  }

  /**
   * returns page descripton for list
   */
  get description() {
    // return description string
    return 'Customizable Chart Block';
  }
}