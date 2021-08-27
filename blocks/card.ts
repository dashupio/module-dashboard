
// import page interface
import { Struct } from '@dashup/module';

/**
 * build address helper
 */
export default class CardBlock extends Struct {

  /**
   * returns page type
   */
  get type() {
    // return page type label
    return 'card';
  }

  /**
   * returns page type
   */
  get icon() {
    // return page type label
    return 'fad fa-pen-square';
  }

  /**
   * returns page type
   */
  get title() {
    // return page type label
    return 'Card';
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
      view   : 'block/card',
      config : 'block/card/config',
    };
  }

  /**
   * returns category list for page
   */
  get categories() {
    // return array of categories
    return ['phone', 'dashboard'];
  }

  /**
   * returns page descripton for list
   */
  get description() {
    // return description string
    return 'Customizable Card Block';
  }
}