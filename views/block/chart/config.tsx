
// import react
import shortid from 'shortid';
import dotProp from 'dot-prop';
import React, { useState } from 'react';
import { Query, Select, Color, colors } from '@dashup/ui';

// block list
const BlockChartConfig = (props = {}) => {
  // metrics
  const [color, setColor] = useState(null);
  const [active, setActive] = useState(null);
  const [metrics, setMetrics] = useState(props.block.models || []);

  // get chart
  const getChart = () => {
    // return mapped
    return [['area', 'Area'], ['bar', 'Bar'], ['line', 'Line'], ['pie', 'Pie'], ['donut', 'Donut'], ['polarArea', 'Polar Area'], ['radialBar', 'Radial Bar']].map(([type, title]) => {
      // return values
      return {
        value : type,
        label : title,

        selected : (props.block.chart || 'area') === type,
      };
    });
  };

  // get forms
  const getModel = (metric) => {
    // get forms
    const models = Array.from(props.dashup.get('pages').values()).filter((page) => {
      // return model pages
      return page.get('type') === 'model' && !page.get('archived');
    });

    // return mapped
    return models.map((model) => {
      // return values
      return {
        value : model.get('_id'),
        label : model.get('name'),

        selected : metric.model === model.get('_id'),
      };
    });
  };

  // get forms
  const getForm = (metric) => {
    // get forms
    const forms = Array.from(props.dashup.get('pages').values()).filter((page) => {
      // return model pages
      return page.get('type') === 'form' && page.get('data.model') === metric.model && !page.get('archived');
    });

    // return mapped
    return forms.map((form) => {
      // return values
      return {
        value : form.get('_id'),
        label : form.get('name'),

        selected : metric.model === form.get('_id'),
      };
    });
  };
  

  // get metric
  const getMetric = (metric) => {
    // return types
    return [{
      value : 'count',
      label : 'Count of Rows'
    }, {
      value : 'field',
      label : 'Count of...'
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
      if (item.value === metric.metric) item.selected = true;
    
      // return item
      return item;
    });
  }

  // get fields
  const getFields = (metric) => {
    // return nothing
    if (!metric.model) return [];

    // get forms
    const forms = props.getForms([metric.model]);
    
    // return fields
    return props.getFields(forms);
  }

  // get field
  const getField = (metric) => {
    // return value
    return [...(getFields(metric))].filter((f) => metric.metric !== 'field' ? ['number', 'money', 'date'].includes(f.type) : true).map((field) => {
      // return fields
      return {
        label    : field.label,
        value    : field.uuid,
        selected : metric.field === field.uuid,
      };
    });
  };

  // on remove
  const onRemove = (metric) => {
    // new metrics
    const newMetrics = [...metrics].filter((m) => m.uuid !== metric.uuid);

    // setmetrics
    setBlock('models', newMetrics);
    setMetrics(newMetrics);
  };

  // get grouping
  const getGrouping = (metric) => {
    // return value
    return [{
      label    : 'Total',
      value    : 'total',
      selected : (metric.grouping || 'total') === 'total',
    }, {
      label    : 'Created',
      value    : 'created',
      selected : metric.grouping === 'created',
    }, {
      label    : 'Updated',
      value    : 'updated',
      selected : metric.grouping === 'updated',
    }];
  }

  // set block
  const setBlock = (key, value, prev) => {
    // set props block
    return props.setBlock(props.block, key, value, prev);
  };

  // set metric
  const setMetric = (metric, key, value) => {
    // set metric
    dotProp.set(metric, key, value);

    // set metrics
    setBlock('models', metrics);
    setMetrics([...metrics]);
  };

  // return jsx
  return (
    <div>
      <div className="mb-3">
        <div className="mb-3">
          <label className="form-label">
            Choose Chart
          </label>
          <Select options={ getChart() } defaultValue={ getChart().filter((f) => f.selected) } onChange={ (val) => setBlock('chart', val?.value) } />
        </div>
      </div>
      <div className="mb-3">
        <div className="form-check form-switch">
          <input className="form-check-input" id="is-minimal" type="checkbox" onChange={ (e) => setBlock('minimal', e.target.checked) } checked={ props.block.minimal } />
          <label className="form-check-label" htmlFor="is-minimal">
            Minimal Chart
          </label>
        </div>
      </div>
      <div className="mb-3">
        <div className="form-check form-switch">
          <input className="form-check-input" id="is-totals" type="checkbox" onChange={ (e) => setBlock('totals', e.target.checked) } checked={ props.block.totals } />
          <label className="form-check-label" htmlFor="is-totals">
            Enable Totals
          </label>
        </div>
      </div>
      { !!props.block.totals && (
        <div className="mb-3">
          <div className="form-check form-switch">
            <input className="form-check-input" id="is-center" type="checkbox" onChange={ (e) => setBlock('center', e.target.checked) } checked={ props.block.center } />
            <label className="form-check-label" htmlFor="is-center">
              Align Totals Center
            </label>
          </div>
        </div>
      ) }
      { !!props.block.totals && (
        <div className="mb-3">
          <div className="form-check form-switch">
            <input className="form-check-input" id="is-previous" type="checkbox" onChange={ (e) => setBlock('previous', e.target.checked) } checked={ props.block.previous } />
            <label className="form-check-label" htmlFor="is-previous">
              Enable Since Previous
            </label>
          </div>
        </div>
      ) }
      
      { metrics.map((metric) => {
        // return jsx
        return (
          <div key={ `metric-${metric.uuid}` } className="card mb-3">
            <div className="card-body">
              <div className="d-flex flex-row mb-3">
                <div className="flex-0 me-3">
                  <div className="mb-3">
                    <label className="d-block form-label">
                      Color
                    </label>
                    <button type="button" className="btn px-3" onClick={ (e) => !setActive(metric) && setColor(e.target) } style={ {
                      background : metric.color?.hex,
                    } }>
                      &nbsp;
                    </button>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="form-label">
                    Label
                  </label>
                  <input className="form-control" value={ metric.label || '' } onChange={ (e) => setMetric(metric, 'label', e.target.value) } />
                </div>
                <div className="flex-0 ms-3">
                  <label className="form-label">
                    Remove
                  </label>
                  <button type="button" className="btn btn-danger px-3" onClick={ (e) => onRemove(metric) }>
                    <i className="fa fa-trash" />
                  </button>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">
                  Choose Model
                </label>
                <Select options={ getModel(metric) } defaultValue={ getModel(metric).filter((f) => f.selected) } onChange={ (val) => setMetric(metric, 'model', val?.value) } />
                <small>
                  The model this page should display.
                </small>
              </div>

              { !!metric.model && (
                <>
                  <div className="mb-3">
                    <label className="form-label">
                      Choose Form
                    </label>
                    <Select options={ getForm(metric) } defaultValue={ getForm(metric).filter((f) => f.selected) } onChange={ (val) => setMetric(metric, 'form', val?.value) } />
                    <small>
                      The form that this grid will filter by.
                    </small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Metric
                    </label>
                    <div>
                      <div className="d-inline-block select-inline me-2">
                        <Select options={ getMetric(metric) } defaultValue={ getMetric(metric).filter((f) => f.selected) } onChange={ (val) => setMetric(metric, 'metric', val?.value) } />
                      </div>
                      { metric.metric !== 'count' && (
                        <div className="d-inline-block select-inline me-2">
                          <Select options={ getField(metric) } defaultValue={ getField(metric).filter((f) => f.selected) } onChange={ (val) => setMetric(metric, 'field', val?.value) } />
                        </div>
                      ) }
                      <span className="me-2">
                        Grouped by
                      </span>
                      <div className="d-inline-block select-inline me-2">
                        <Select options={ getGrouping(metric) } defaultValue={ getGrouping(metric).filter((f) => f.selected) } onChange={ (val) => setMetric(metric, 'grouping', val?.value) } />
                      </div>
                    </div>
                  </div>
                </>
              ) }

              <hr />
                    
              <div>
                <label className="form-label">
                  Filter By
                </label>
                <Query
                  isString

                  page={ props.page }
                  query={ metric.filter }
                  dashup={ props.dashup }
                  fields={ getFields(metric) }
                  onChange={ (val) => setMetric(metric, 'filter', val) }
                  getFieldStruct={ props.getFieldStruct }
                  />
              </div>
            </div>
          </div>
        )
      }) }
      <div className="d-flex">
        <button className="btn btn-success" onClick={ (e) => setMetrics([...metrics, { uuid : shortid() }])}>
          Add Metric
        </button>
      </div>

      { !!active && !!color && <Color target={ color } show color={ active?.hex || 'transparent' } colors={ Object.values(colors) } onHide={ () => !setActive(null) && setColor(null) } onChange={ (hex) => setMetric(active, 'color', hex.hex === 'transparent' ? null : hex) } /> }
    </div>
  );
}

// export default
export default BlockChartConfig;