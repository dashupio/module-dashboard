
// import react
import React from 'react';
import { Hbs, View, Query, Select } from '@dashup/ui';

// block list
const BlockChartConfig = (props = {}) => {

  // get forms
  const getModels = () => {
    // get forms
    const forms = Array.from(props.dashup.get('pages').values()).filter((page) => {
      // return model pages
      return page.get('type') === 'model';
    });

    // return mapped
    return forms.map((form) => {
      // return values
      return {
        value : form.get('_id'),
        label : form.get('name'),

        selected : (props.model || props.block.model).includes(form.get('_id')),
      };
    });
  };

  // get forms
  const getForms = () => {
    // get forms
    const forms = Array.from(props.dashup.get('pages').values()).filter((page) => {
      // return model pages
      return page.get('type') === 'form' && page.get('data.model') === (props.model || props.block.model);
    });

    // return mapped
    return forms.map((form) => {
      // return values
      return {
        value : form.get('_id'),
        label : form.get('name'),

        selected : (props.block.form || []).includes(form.get('_id')),
      };
    });
  };
  

  // get metric
  const getMetric = () => {
    // return types
    return [{
      value : 'count',
      label : 'Count of Rows'
    }, {
      value : 'sum',
      label : 'Sum of...',
    }, {
      value : 'avg',
      label : 'Average of...',
    }, {
      value : 'min',
      label : 'Minimum of...',
    }, {
      value : 'max',
      label : 'Maximum of...',
    }].map((item) => {
      // set selected
      if (item.value === props.block.metric) item.selected = true;
    
      // return item
      return item;
    });
  }

  // get fields
  const getFields = () => {
    // return nothing
    if (!props.block.model) return [];

    // get forms
    const forms = props.getForms([props.block.model]);
    
    // return fields
    return props.getFields(forms);
  }

  // get field
  const getField = () => {
    // return value
    return [...(getFields())].filter((f) => ['number', 'money', 'date'].includes(f.type)).map((field) => {
      // return fields
      return {
        label    : field.label,
        value    : field.uuid,
        selected : props.block.field === field.uuid,
      };
    });
  };

  // get group
  const getGroup = () => {
    // return value
    return getFields().map((field) => {
      // return fields
      return {
        label    : field.label,
        value    : field.uuid,
        selected : props.block.group === field.uuid,
      };
    });
  }

  // get grouping
  const getGrouping = () => {
    // return value
    return [{
      label    : 'Total',
      value    : 'total',
      selected : (props.block.grouping || 'total') === 'total',
    }, {
      label    : 'Created',
      value    : 'created',
      selected : props.block.grouping === 'created',
    }, {
      label    : 'Updated',
      value    : 'updated',
      selected : props.block.grouping === 'updated',
    }, {
      label    : 'Field',
      value    : 'field',
      selected : props.block.grouping === 'field',
    }];
  }

  // set block
  const setBlock = (key, value, prev) => {
    // set props block
    return props.setBlock(props.block, key, value, prev);
  };

  // on forms
  const onModel = (value) => {
    // set data
    setBlock('model', value?.value);
  };

  // on forms
  const onForm = (value) => {
    // set data
    setBlock('form', value?.value);
  };

  // return jsx
  return (
    <>
      <div className="mb-3">
        <label className="form-label">
          Choose Model
        </label>
        <Select options={ getModels() } defaultValue={ getModels().filter((f) => f.selected) } onChange={ onModel } />
        <small>
          The model this page should display.
        </small>
      </div>

      { !!(props.model || props.block.model) && (
        <>
          <div className="mb-3">
            <label className="form-label">
              Choose Form
            </label>
            <Select options={ getForms() } defaultValue={ getForms().filter((f) => f.selected) } onChange={ onForm } />
            <small>
              The forms that this grid will filter by.
            </small>
          </div>
          <div className="mb-3">
            <label className="form-label">
              Metric
            </label>
            <div>
              <div className="d-inline-block select-inline me-2">
                <Select options={ getMetric() } defaultValue={ getMetric().filter((f) => f.selected) } onChange={ (val) => setBlock('metric', val?.value) } />
              </div>
              { props.block.metric !== 'count' && (
                <div className="d-inline-block select-inline me-2">
                  <Select options={ getField() } defaultValue={ getField().filter((f) => f.selected) } onChange={ (val) => setBlock('field', val?.value) } />
                </div>
              ) }
              <span className="me-2">
                Grouped by
              </span>
              <div className="d-inline-block select-inline me-2">
                <Select options={ getGrouping() } defaultValue={ getGrouping().filter((f) => f.selected) } onChange={ (val) => setBlock('grouping', val?.value) } />
              </div>
              { props.block.grouping === 'field' && (
                <div className="d-inline-block select-inline me-2">
                  <Select options={ getGroup() } defaultValue={ getGroup().filter((f) => f.selected) } onChange={ (val) => setBlock('group', val?.value) } />
                </div>
              ) }
            </div>
          </div>
        </>
      ) }

      <hr />
  
      <div className="mb-3">
        <label className="form-label">
          Element Display
        </label>
        <View
          type="field"
          view="code"
          struct="code"
          mode="handlebars"
          value={ props.block.display || '{{value}}' }
          dashup={ props.dashup }
          onChange={ (val) => setBlock('display', val, true) }
          />
        <div className="alert alert-primary mt-2">
          <Hbs template={ props.block.display || '{{value}}' } data={ { value : 10 } } />
        </div>
      </div>
            
      <div className="mb-3">
        <label className="form-label">
          Filter By
        </label>
        <Query
          isString

          page={ props.page }
          query={ props.block.filter }
          dashup={ props.dashup }
          fields={ getFields() }
          onChange={ (val) => setBlock('filter', val) }
          getFieldStruct={ props.getFieldStruct }
          />
      </div>
    </>
  );
}

// export default
export default BlockChartConfig;