
// import react
import React from 'react';
import { Hbs, View, Query } from '@dashup/ui';

// block list
const BlockChartConfig = (props = {}) => {

  // set block
  const setBlock = (key, value, prev = false) => {
    // set props block
    return props.setBlock(props.block, key, value, prev);
  };

  // set tabs
  if (!props.block.tabs) props.block.tabs = [];

  // on create
  const onCreate = (e) => {
    // prevent default
    e.preventDefault();
    e.stopPropagation();

    // add option
    props.block.tabs.push({
      title   : '',
      display : '',
    });

    // run opts
    setBlock('tabs', props.block.tabs);
  };

  // on remove
  const onRemove = (e, i) => {
    // prevent default
    e.preventDefault();
    e.stopPropagation();

    // remove option
    props.block.tabs.splice(i, 1);

    // run opts
    setBlock('tabs', props.block.tabs);
  };

  // on title
  const onTitle = (e, tab) => {
    // set value
    tab.title = e.target.value;

    // run opts
    setBlock('tabs', props.block.tabs);
  };

  // on display
  const onDisplay = (tab, value) => {
    // set display
    tab.display = value;
    
    // set color
    setBlock('tabs', props.block.tabs);
  };

  // on background
  const onBackground = (e) => {
    // on background
    setBlock('background', e.target.checked);
  };

  // return jsx
  return (
    <>
      <div className="mb-3">
        <div className="form-check form-switch">
          <input className="form-check-input" id="is-required" type="checkbox" onChange={ onBackground } checked={ props.block.background } />
          <label className="form-check-label" htmlFor="is-required">
            Enable Background
          </label>
        </div>
      </div>

      <hr />
    
      { (props.block.tabs || []).map((tab, i) => {
        // return jsx
        return (
          <div key={ `tab-config-${i}` } className="mb-3">
            <label className="form-label">
              Tab #{ i + 1 }
            </label>
            <div className="d-flex mb-2">
              <input type="text" name="tab[{ i }]" value={ tab.title } className="form-control flex-1" onChange={ (e) => onTitle(e, tab) } />
              <button className="btn btn-danger ms-2" onClick={ (e) => onRemove(e, i) }>
                <i className="fa fa-times" />
              </button>
            </div>
            <View
              type="field"
              view="code"
              struct="code"
              mode="handlebars"
              value={ tab.display || '' }
              dashup={ props.dashup }
              onChange={ (val) => onDisplay(tab, val) }
              />
          </div>
        );
      }) }

      <button className="btn btn-success me-3" onClick={ (e) => onCreate(e) }>
        Add Tab
      </button>
    </>
  );
}

// export default
export default BlockChartConfig;