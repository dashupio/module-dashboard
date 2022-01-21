
// import react
import shortid from 'shortid';
import dotProp from 'dot-prop';
import React, { useState } from 'react';
import { Box, Button, Stack, View, Query, Color, colors, TextField, MenuItem, FormGroup, FormControlLabel, Switch, Card, Divider, CardContent, CardHeader, IconButton, Icon } from '@dashup/ui';

// block list
const BlockChartConfig = (props = {}) => {
  // metrics
  const [color, setColor] = useState(null);
  const [active, setActive] = useState(null);
  const [metrics, setMetrics] = useState(props.block.models || []);

  // get chart
  const getChart = () => {
    // return mapped
    return [['total', 'Total'], ['area', 'Area'], ['bar', 'Bar'], ['line', 'Line'], ['pie', 'Pie'], ['donut', 'Donut'], ['polarArea', 'Polar Area'], ['radialBar', 'Radial Bar']].map(([type, title]) => {
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
    <>
      <TextField
        label="Choose Chart"
        value={ props.block.chart || 'area' }
        onChange={ (e) => setBlock('chart', e.target.value) }
        select
        fullWidth
      >
        { getChart().map((option) => {
          // return jsx
          return (
            <MenuItem key={ option.value } value={ option.value }>
              { option.label }
            </MenuItem>
          );
        }) }
      </TextField>
      
      <FormGroup>
        <FormControlLabel control={ <Switch defaultChecked={ props.block.minimal } onChange={ (e) => setBlock('minimal', e.target.checked) } /> } label="Minimal Chart" />
      </FormGroup>
      
      <FormGroup>
        <FormControlLabel control={ <Switch defaultChecked={ props.block.totals } onChange={ (e) => setBlock('totals', e.target.checked) } /> } label="Enable Totals" />
      </FormGroup>
      
      { !!props.block.totals && (
        <FormGroup>
          <FormControlLabel control={ <Switch defaultChecked={ props.block.change } onChange={ (e) => setBlock('change', e.target.checked) } /> } label="Enable Change %" />
        </FormGroup>
      ) }
      
      { ['bar', 'area', 'line'].includes(props.block.chart || 'area') && (
        <FormGroup>
          <FormControlLabel control={ <Switch defaultChecked={ props.block.previous } onChange={ (e) => setBlock('previous', e.target.checked) } /> } label="Enable Previous" />
        </FormGroup>
      ) }

      <Box my={ 2 }>
        <Divider />
      </Box>

      { !!active && !!color && <Color target={ color } show color={ active?.hex } colors={ Object.values(colors) } onClose={ () => !setActive(null) && setColor(null) } onChange={ (hex) => setMetric(active, 'color', hex.hex === 'transparent' ? null : hex) } /> }
      
      { metrics.map((metric, i) => {
        // return jsx
        return (
          <Card key={ `metric-${metric.uuid}` } sx={ {
            mb : 2,
          } } variant="outlined">
            <CardHeader
              title={ metric.name || `Metric #${i + 1}` }
              action={ (
                <>
                  <IconButton onClick={ (e) => setMetric(metric, 'open', !metric.open) }>
                    <Icon type="fas" icon={ metric.open ? 'times' : 'pencil' } />
                  </IconButton>
                  <IconButton onClick={ (e) => onRemove(metric) } color="error">
                    <Icon type="fas" icon="trash" />
                  </IconButton>
                </>
              ) }
            />
            { !!metric.open && (
              <CardContent>
                <Stack direction="row" spacing={ 2 } sx={ {
                  mb : 2,
                } }>
                  <Button variant="contained" onClick={ (e) => !setActive(metric) && setColor(e.target) } sx={ {
                    color           : metric.color?.hex && theme.palette.getContrastText(metric.color?.hex),
                    backgroundColor : metric.color?.hex,
                  } }>
                    <Icon type="fas" icon="tint" />
                  </Button>
                  <TextField
                    value={ metric.name || '' }
                    label="Name"
                    onChange={ (e) => setMetric(metric, 'name', e.target.value) }
                    fullWidth
                  />
                </Stack>
                <TextField
                  label="Chart Model"
                  value={ metric.model }
                  select
                  onChange={ (e) => setMetric(metric, 'model', e.target.value) }
                  fullWidth
                  helperText="View Chart with this model's items."
                >
                  { getModel(metric).map((option) => (
                    <MenuItem key={ option.value } value={ option.value }>
                      { option.label }
                    </MenuItem>
                  ))}
                </TextField>

                { !!metric.model && (
                  <>
                    <TextField
                      label="Choose Form"
                      value={ metric.form }
                      select
                      onChange={ (e) => setMetric(metric, 'form', e.target.value) }
                      fullWidth
                      helperText="The form that this grid will filter by."
                    >
                      { getForm(metric).map((option) => (
                        <MenuItem key={ option.value } value={ option.value }>
                          { option.label }
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      label="Choose Metric"
                      value={ metric.metric }
                      select
                      onChange={ (e) => setMetric(metric, 'metric', e.target.value) }
                      fullWidth
                    >
                      { getMetric(metric).map((option) => (
                        <MenuItem key={ option.value } value={ option.value }>
                          { option.label }
                        </MenuItem>
                      ))}
                    </TextField>
                    { metric.metric !== 'count' && (
                      <TextField
                        label="Choose Field"
                        value={ metric.field }
                        select
                        onChange={ (e) => setMetric(metric, 'field', e.target.value) }
                        fullWidth
                      >
                        { getField(metric).map((option) => (
                          <MenuItem key={ option.value } value={ option.value }>
                            { option.label }
                          </MenuItem>
                        ))}
                      </TextField>
                    ) }
                    <TextField
                      label="Grouped by"
                      value={ metric.grouping }
                      select
                      onChange={ (e) => setMetric(metric, 'grouping', e.target.value) }
                      fullWidth
                    >
                      { getGrouping(metric).map((option) => (
                        <MenuItem key={ option.value } value={ option.value }>
                          { option.label }
                        </MenuItem>
                      ))}
                    </TextField>
                  </>
                ) }

                <View
                  type="field"
                  view="input"
                  mode="handlebars"
                  struct="code"
                  field={ {
                    label : 'Display',
                  } }
                  value={ metric.display || '{{ value }}' }
                  dashup={ props.dashup }
                  onChange={ (f, val) => setMetric(metric, 'display', val) }
                />

                <Box my={ 2 }>
                  <Divider />
                </Box>

                <Query
                  isString

                  page={ props.page }
                  label="Filter By"
                  query={ metric.filter }
                  dashup={ props.dashup }
                  fields={ getFields(metric) }
                  onChange={ (val) => setMetric(metric, 'filter', val) }
                  getFieldStruct={ props.getFieldStruct }
                />
              </CardContent>
            ) }
            <Box />
          </Card>
        );
      }) }

      <Box textAlign="right">
        <Button color="success"  onClick={ (e) => setMetrics([...metrics, { uuid : shortid() }]) }>
          Add Metric
        </Button>
      </Box>

    </>
  );
}

// export default
export default BlockChartConfig;