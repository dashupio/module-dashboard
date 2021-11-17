
// import react
import moment from 'moment';
import React, { useState, useEffect } from 'react';
import { Box, Hbs, Chart, colors, Card, CardContent, CardHeader, CircularProgress } from '@dashup/ui';

// templates
const templates = {};

// create value
const configs = {
  day : {
    sub    : 'hour',
    amount : 24,
  },
  week : {
    sub    : 'day',
    amount : 14,
  },
  month : {
    sub    : 'day',
    amount : 31,
  },
};

// create chart block
const BlockChart = (props = { range : 'month', date : new Date() }) => {
  // use state
  const [chart, setChart] = useState({});
  const [loading, setLoading] = useState(true);

  // fix context
  const fixContext = (where) => {
    // iterate object
    const iter = (obj) => {
      // check keys
      Object.keys(obj || {}).forEach((key) => {
        // iterate sub
        if (typeof obj[key] === 'object') return obj[key] = iter(obj[key]);

        // check string
        if (typeof obj[key] === 'string' && obj[key].includes('{{')) {
          // log context
          if (!templates[obj[key]]) templates[obj[key]] = handlebars.compile(obj[key]);

          // key
          obj[key] = templates[obj[key]](props.context || {});
        }
      });

      // return fixed
      return obj;
    };

    // iterate object
    return iter(where);
  };

  // load chart
  const loadChart = async (chart) => {
    // get model
    const model = props.dashup.page(chart.model);

    // filter
    const filter = typeof chart.filter === 'string' ? JSON.parse(chart.filter) : [];

    // get metric
    const metric   = chart.metric   || 'avg';
    const grouping = chart.grouping || 'total';

    // get forms
    const forms = props.getForms([model]);
    const fields = props.getFields(forms);

    // get field
    const field = chart.field ? props.getField(chart.field, fields) : null;

    // key
    const fieldKey = field ? (field.type === 'date' ? `${(field.name || field.uuid)}.duration` : (field.name || field.uuid)) : null;

    // set type
    let data = null;

    // get query
    const getQuery = () => {
      // create query
      let query = model;

      // check filters
      filter.forEach((where) => {
        // fixed
        const fixed = fixContext(where);
        
        // check fixed
        if (!Object.keys(fixed).length) return;

        // query
        query = query.where(fixed);
      });

      // return query
      return query;
    };

    // group key
    let groupKey = null;

    // set key
    if (grouping === 'total' || grouping === 'created') {
      // updated
      groupKey = 'created_at';
    } else if (grouping === 'updated') {
      // updated
      groupKey = 'updated_at';
    }

    // check grouping
    if (groupKey) {
      // create data
      const createData = async (fn) => {
        // get config
        const subConfig = configs[props.range];

        // create loop array
        const loopArr = [];

        // set amount
        if (props.range === 'month') {
          // set amount
          subConfig.amount = moment(props.date).daysInMonth();
        }

        // for each
        for (let i = 0; i < subConfig.amount; i++) {
          // push
          loopArr.push(i);
        }

        // create data
        return {
          ...chart,

          // last period
          last : await fn(
            getQuery()
            .gt(groupKey, moment(props.date).subtract(1, `${props.range}s`).startOf(props.range).toDate())
            .lt(groupKey, moment(props.date).startOf(props.range).toDate())
          ),

          // current period
          current : await fn(
            getQuery()
            .gt(groupKey, moment(props.date).startOf(props.range).toDate())
            .lt(groupKey, moment(props.date).add(1, `${props.range}s`).startOf(props.range).toDate())
          ),

          // total
          total : await fn(getQuery()),

          // actual series
          series : await Promise.all(loopArr.map(async (i) => {
            return {
              x : moment(props.date).subtract(i, `${subConfig.sub}s`).startOf(subConfig.sub).toDate(),
              y : await fn(
                ['total'].includes(grouping) ? (
                  await getQuery()
                  .lt(groupKey, moment(props.date).subtract((i - 1), `${subConfig.sub}s`).startOf(subConfig.sub).toDate())
                ) : (
                  await getQuery()
                  .gt(groupKey, moment(props.date).subtract(i, `${subConfig.sub}s`).startOf(subConfig.sub).toDate())
                  .lt(groupKey, moment(props.date).subtract((i - 1), `${subConfig.sub}s`).startOf(subConfig.sub).toDate())
                )
              )
            };
          })),
        };
      };

      // get one value...
      if (metric === 'count' || !metric) {
        // set data
        data = await createData(async (q) => {
          // return counted
          return await q.count() || 0;
        });
      } else if (!field) {
        // return json
        return;
      } else if (metric === 'sum') {
        // set data
        data = await createData(async (q) => {
          // return counted
          return await q.gt(fieldKey, 0).sum(fieldKey) || 0;
        });
      } else if (metric === 'avg') {
        // set data
        data = await createData(async (q) => {
          // return counted
          return await q.gt(fieldKey, 0).avg(fieldKey) || 0;
        });
      } else if (metric === 'min') {
        // set data
        data = await createData(async (q) => {
          // get value
          const value = await q.gt(fieldKey, 0).sort(fieldKey, 1).findOne();

          // return counted
          return value ? value.get(fieldKey) : 0;
        });
      } else if (metric === 'max') {
        // set data
        data = await createData(async (q) => {
          // get value
          const value = await q.gt(fieldKey, 0).sort(fieldKey, -1).findOne();

          // return counted
          return value ? value.get(fieldKey) : 0;
        });
      } else if (metric === 'field') {
        // counts
        const countedData = await createData(async (q) => {
          // return counted
          return await q.count(field.name || field.uuid, true) || {};
        });

        // keys
        const labels = countedData.series.reduce((accum, item) => {
          // keys 
          const keys = Object.keys(item.y);

          // map
          keys.forEach((key) => {
            // check includes
            if (!accum.includes(key)) accum.push(key);
          });

          // return accum
          return accum;
        }, []);

        // loop labels
        data = labels.sort().map((label) => {
          // return new data
          return {
            ...countedData,
            label,

            uuid   : `${countedData.uuid}-${label}`,
            color  : field?.options?.find((opt) => opt.value === label)?.color,
            series : countedData.series.map((item) => {
              // return new item
              return {
                x : item.x,
                y : item.y[label] || 0,
              };
            }),

            last    : countedData.last[label] || 0,
            total   : countedData.total[label] || 0,
            current : countedData.current[label] || 0,
          };
        });
      }
    }

    // check data
    if (!data) return;

    // return value
    return data;
  };

  // load chart
  const loadCharts = async () => {
    // return nothing
    if (!props.block.models) return {};

    // map
    const values = (await Promise.all(props.block.models.map((metric) => loadChart(metric)))).reduce((accum, val) => {
      // check array
      if (!Array.isArray(val)) val = [val];

      // push
      accum.push(...val);
      
      // return accum
      return accum;
    }, []).filter((v) => v).map((v) => {
      if (!v.color?.hex) v.color = {
        hex : randomColor(),
      };
      
      return v;
    });

    // series
    let labels = [];
    let series = values.map((val) => {
      return {
        name : val.name,
        data : val.series,
      };
    });

    // check type
    if (['pie', 'donut', 'polarArea', 'radialBar'].includes(props.block.chart)) {
      // totals
      labels = values.map((val) => val.name);
      series = values.map((val) => val.total);
    }
    
    // return parsed data
    const data = {
      values,

      series,
      type    : props.block.chart || 'area',
      options : {
        labels,
        colors : values.map((m) => m.color?.hex),
        
        stroke : {
          curve : 'smooth'
        },
        fill : {
          opacity : 0.7
        },
        xaxis : {
          type : ['pie', 'donut', 'polarArea', 'radialBar'].includes(props.block.chart) ? undefined : 'datetime'
        },
        dataLabels : {
          enabled : false
        },
        chart : {
          toolbar : {
            show   : true,
            export : {
              csv : {
                filename : `${props.block.name || props.block.uuid}`,
              },
              svg : {
                filename : `${props.block.name || props.block.uuid}`,
              },
              png : {
                filename : `${props.block.name || props.block.uuid}`,
              }
            },
          },
        }
      },
    };

    // check labels
    if (props.block.minimal) {
      // set chart
      data.options.chart = {
        sparkline : {
          enabled : true,
        },
      };
    }

    // return data
    return data;
  }

  // uc first
  const ucFirst = (str) => {
    // return
    return `${str}`.charAt(0).toUpperCase() + `${str}`.slice(1);
  };

  // random color
  const randomColor = () => {
    // keys
    const keys = Object.keys(colors).filter((k) => !['white', 'light', 'body', 'gray', 'dark', 'gray-dark', 'transparent'].includes(k));

    // random
    return colors[keys[Math.floor(Math.random() * keys.length)]];
  };

  // get difference
  const getDifference = (a, b) => {
    // return difference
    const val = (100 * Math.abs((a - b) / ((a + b) / 2))).toFixed(2);

    // check value
    if (isNaN(val)) return '0';

    // return val
    return val;
  };

  // use effect
  useEffect(() => {
    setLoading(true);
    loadCharts().then((chart) => {
      setChart(chart);
      setLoading(false);
    });
  }, [props.page && props.page.get('_id'), props.block.chart, props.block.minimal, props.block.totals, props.block.previous, props.date, props.range, JSON.stringify(props.block.models)]);

  // return jsx
  return (
    <Card sx={ {
      width         : '100%',
      height        : '100%',
      display       : 'flex',
      overflow      : 'initial',
      flexDirection : 'column',
    } }>
      { !!props.block.name && (
        <CardHeader
          title={ `${props.block.name || ''} ${props.range === 'day' ? '' : `${ucFirst(props.range)} of `}${moment(props.date).startOf(props.range).format('MMM Do')}` }
        />
      ) }
      { !!props.block.totals && (
        <CardContent sx={ {
          flex : 1,
        } }>
          { chart.values?.map((value, i) => {
            // return jsx
            return (
              <Box key={ `value-${i}` } sx={ {
                color : value.color?.hex,
              } }>
                <Hbs template={ value.display || `{{value}} ${value.name}` } data={ { value : (value.total || 0) } } isInline />

                { !!props.block.previous && (
                  <Box sx={ {
                    fontWeight : 'bold',
                  } }>
                    { (value.last || 0) > (value.current || 0) && (
                      <>
                        -<Hbs template={ value.display || `{{value}} ${value.name}` } data={ { value : (value.last || 0) - (value.current || 0) } } isInline />
                        { ` (-${getDifference((value.last || 0), (value.current || 0))}%) ` }
                      </>
                    ) }
                    { (value.last || 0) < (value.current || 0) && (
                      <>
                        +<Hbs template={ value.display || `{{value}} ${value.name}` } data={ { value : (value.current || 0) - (value.last || 0) } } isInline />
                        { ` (+${getDifference((value.last || 0), (value.current || 0))}%) ` }
                      </>
                    ) }
                    { (value.last || 0) === (value.current || 0) ? `No change` : '' }
                    { ` since previous ${props.range} ` }
                  </Box>
                ) }
              </Box>
            );
          }) }
        </CardContent>
      ) }
      <CardContent sx={ {
        flex    : 1,
        display : 'flex',
      } }>
        { loading ? (
          <Box flex={ 1 } alignItems="center" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : (
          <Box flex={ 1 } position="relative">
            <Box position="absolute" left={ 0 } right={ 0 } top={ 0 } bottom={ 0 }>
              <Chart { ...chart } />
            </Box>
          </Box>
        ) }
      </CardContent>
      <Box />
    </Card>
  );
};

// export default
export default BlockChart;