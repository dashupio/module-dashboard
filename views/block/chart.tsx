
// import react
import moment from 'moment';
import React, { useState, useEffect } from 'react';
import { Box, cache, Hbs, Chart, Typography, colors, Card, CardContent, useTheme, CardHeader, CircularProgress } from '@dashup/ui';

// templates
const templates = {};

// create value
const configs = {
  day : {
    sub    : 'hour',
    group  : '%Y-%m-%d-%H',
    format : 'YYYY-MM-DD-HH',
    amount : 24,
  },
  week : {
    sub    : 'day',
    group  : '%Y-%m-%d',
    format : 'YYYY-MM-DD',
    amount : 7,
  },
  month : {
    sub    : 'day',
    group  : '%Y-%m-%d',
    format : 'YYYY-MM-DD',
    amount : 31,
  },
};

// create chart block
const BlockChart = (props = { range : 'month', date : new Date() }) => {
  // use state
  const theme = useTheme();
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
    // chart
    return cache(`${JSON.stringify(chart)}:${props.range}:${props.date}`, async () => {
      // get model
      const model = props.dashup.page(chart.model);
  
      // filter
      const filter = typeof chart.filter === 'string' ? JSON.parse(chart.filter) : [];

      // has previous
      const hasPrevious = ['bar', 'area', 'line'].includes(props.block.chart || 'area') && props.block.previous;
  
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
        // get model
        const model = props.dashup.page(chart.model);
        
        // create query
        let query = model.batch();
  
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

      // get config
      const subConfig = configs[props.range];

      // set amount
      if (props.range === 'month') {
        // set amount
        subConfig.amount = moment(props.date).daysInMonth();
      }

      // check group key
      if (!groupKey) return;

      // check grouping
      if (groupKey) {
        // create data
        const createData = async (fn, ...args) => {
          // batch
          const [
            last,
            previousLast,
            total,
            series,
            previousSeries,
          ] = await model.execBatch(await Promise.all([
            // loaded last
            ['total'].includes(grouping) ? (
              fn(
                getQuery()
                  .lt(groupKey, moment(props.date).startOf(props.range).toDate())
              )
            ) : (
              fn(
                getQuery()
                  .gt(groupKey, moment(props.date).startOf(props.range).subtract(subConfig.amount, `${subConfig.sub}s`).toDate())
                  .lt(groupKey, moment(props.date).startOf(props.range).toDate())
              )
            ),

            // previous last
            hasPrevious && fn(
              getQuery()
                .gt(groupKey, moment(props.date).startOf(props.range).subtract(subConfig.amount * 2, `${subConfig.sub}s`).toDate())
                .lt(groupKey, moment(props.date).startOf(props.range).subtract(subConfig.amount, `${subConfig.sub}s`).toDate())
            ),

            // total
            fn(getQuery()),

            // series
            getQuery()
              .gt(groupKey, moment(props.date).startOf(props.range).toDate())
              .lt(groupKey, moment(props.date).endOf(props.range).toDate()).chart(...args),

            // previous series
            hasPrevious && getQuery()
              .gt(groupKey, moment(props.date).subtract(1, props.range).startOf(props.range).toDate())
              .lt(groupKey, moment(props.date).subtract(1, props.range).endOf(props.range).toDate()).chart(...args)
          ]));

          // fix last
          const fixedLast = last && typeof last === 'object' ? last : {
            default : last || 0,
          };
          const fixedTotal = total && typeof total === 'object' ? total : {
            default : total || 0,
          };
          const fixedPreviousLast = previousLast && typeof previousLast === 'object' ? previousLast : {
            default : total || 0,
          };

          console.log('testing', series, previousLast, total);

          // loop values
          return Object.keys(fixedTotal).map((key) => {
            // get value
            const subLast = fixedLast[key] || 0;
            const subTotal = fixedTotal[key] || 0;
            const subPreviousLast = fixedPreviousLast[key] || 0;

            // last total
            let lastTotal = subLast;
            let previousLastTotal = subPreviousLast;

            // loop
            const actualSeries = [];
            const actualPreviousSeries = [];

            // loop
            for (let i = 0; i < subConfig.amount; i++) {
              // get date
              const date = moment(props.date).startOf(props.range).add(i, `${subConfig.sub}s`);

              // key
              const foundKey = Object.keys(series || {}).find((k) => k.includes(`"${date.format(subConfig.format)}"`) && k.includes(`"${key}"`));
              const previousFoundKey = Object.keys(previousSeries || {}).find((k) => k.includes(`"${moment(date.toDate()).subtract(1, props.range).format(subConfig.format)}"`) && k.includes(`"${key}"`));

              // amount
              const amount = (series || {})[foundKey || date.format(subConfig.format)] || 0;
              const previousAmount = hasPrevious && (previousSeries || {})[previousFoundKey || moment(date.toDate()).subtract(1, props.range).format(subConfig.format)] || 0;

              // add amount
              let addAmount = amount;
              let addPreviousAmount = previousAmount;

              // check last total
              if (grouping === 'total') {
                lastTotal += amount;
                addAmount = lastTotal;
  
                previousLastTotal += previousAmount;
                addPreviousAmount = previousLastTotal;
              }

              // check date has
              actualSeries.push({
                x : date.toDate(),
                y : addAmount,
              });
              if (hasPrevious) actualPreviousSeries.push({
                x : date.toDate(),
                y : addPreviousAmount,
              });
            }

            // return actual chart
            return {
              ...chart,

              label   : key === 'default' ? (chart.label || chart.name) : key,

              last    : subLast,
              total   : subTotal,
              current : subTotal - subLast,

              series   : actualSeries,
              previous : actualPreviousSeries,
            };
          });
        };
  
        // get one value...
        if (metric === 'count' || !metric) {
          // set data
          data = await createData(async (q) => {
            // return counted
            return await q.count() || 0;
          }, {
            $dateToString : {
              date   : `$${groupKey}`,
              format : subConfig.group,
            }
          });
        } else if (!field) {
          // return json
          return;
        } else if (metric === 'sum') {
          // set data
          data = await createData(async (q) => {
            // return counted
            return await q.gt(fieldKey, 0).sum(fieldKey) || 0;
          }, {
            $dateToString : {
              date   : `$${groupKey}`,
              format : subConfig.group,
            }
          }, 'sum', fieldKey);
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
          return await createData(async (q) => {
            // return counted
            return q.count(field.name || field.uuid, true);
          }, {
            date : {
              $dateToString : {
                date   : `$${groupKey}`,
                format : subConfig.group,
              }
            },
            field : `$${field.name || field.uuid}`
          });
        }
      }
  
      // check data
      if (!data) return;
  
      // return value
      return data;
    }, 60 * 1000);
  };

  // load chart
  const loadCharts = async () => {
    // return nothing
    if (!props.block.models) return {};

    // colors
    const colors = getColors();

    // has previous
    const hasPrevious = ['bar', 'area', 'line'].includes(props.block.chart || 'area') && props.block.previous;

    // map
    const values = (await Promise.all(props.block.models.map((metric) => loadChart(metric)))).reduce((accum, val) => {
      // check array
      if (!Array.isArray(val)) val = [val];

      // push
      accum.push(...val);
      
      // return accum
      return accum;
    }, []).filter((v) => v);

    // map values
    values.forEach((v, i) => {
      // check color
      if (!v.color?.hex) {
        // check new i
        let newI = i;

        // check entry
        while (!colors[newI]) {
          newI = newI - values.length;
        }

        // color
        v.color = {
          hex : colors[newI],
        };
      }
    });

    // series
    let labels = [];
    let series = values.map((val) => {
      return {
        name : val.name || val.label || 'N/A',
        data : val.series || [],
        type : (props.block.chart || 'area'),
      };
    });

    // value
    if (hasPrevious) series.push(...(values.map((val) => {
      // check previous
      if (!val.previous) return;

      // return value
      return {
        name : `Previous ${val.name || val.label || 'N/A'}`,
        data : val.previous,
        type : 'line',
      };
    })).filter((s) => s));

    // check type
    if (['pie', 'donut', 'polarArea', 'radialBar'].includes(props.block.chart)) {
      // totals
      labels = values.map((val) => val.name || val.label || 'N/A');
      series = values.map((val) => val.total || 0);
    }
    
    // return parsed data
    const data = {
      values,
      series,

      type    : hasPrevious ? undefined : (props.block.chart || 'area'),
      options : {
        labels,
        colors : [
          ...(values.map((v) => {
            // check value
            return v.color?.hex;
          })),
          ...(hasPrevious ? values.map((v) => {
            // check previous
            if (v.previous) return `${v.color?.hex}75`;
          }).filter((v) => v) : [])
        ],
        
        stroke : {
          curve : 'smooth',
          width : [['area', 'line'].includes(props.block.chart) ? 3 : 0, 3],
        },
        theme : {
          mode : theme.palette.mode,
        },
        fill : {
          type    : 'solid',
          opacity : 1
        },
        xaxis : {
          type : ['pie', 'donut', 'polarArea', 'radialBar'].includes(props.block.chart) ? undefined : 'datetime'
        },
        yaxis : {
          min : 0,
        },
        dataLabels : {
          enabled : false
        },
        legend : {
          fontSize   : theme.typography.fontSize,
          fontFamily : theme.typography.fontFamily,
        },
        chart : {
          fontSize   : theme.typography.fontSize,
          foreColor  : theme.palette.text.primary,
          background : theme.palette.background.paper,
          fontFamily : theme.typography.fontFamily,

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

      if (['area'].includes(props.block.chart)) {
        data.options.fill = {
          type    : 'solid',
          opacity : 0.4,
        };
      }

      // check color
      if (props.block?.color) {
        data.options.colors = ['#fff'];
      }
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
  const getColors = () => {
    // keys
    const keys = Object.keys(colors).filter((k) => !['dark', 'darker', 'light', 'lighter', 'transparent'].includes(k));

    // random
    return keys.map((key) => theme.palette[key]?.main);
  };

  // get difference
  const getDifference = (a, b) => {
    // return difference
    const val = ((a > b) ? ((a - b) / a) : ((b - a) / b)) * 100;

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
      width           : '100%',
      height          : '100%',
      display         : 'flex',
      overflow        : 'initial',
      flexDirection   : 'column',
      backgroundColor : props.block.color?.hex,
    } }>
      { !!(props.block.name || props.block.label) && (
        <CardHeader
          sx={ {
            color : props.block.color?.hex ? theme.palette.getContrastText(props.block.color?.hex) : undefined,
          } }
          title={ `${props.block.name || props.block.label || ''} ${props.range === 'day' ? '' : `${ucFirst(props.range)} of `}${moment(props.date).startOf(props.range).format('MMM Do')}` }
        />
      ) }
      { !!props.block.totals && (
        chart.values?.map((value, i) => {
          // return jsx
          return (
            <CardContent
              sx={ {
                color         : props.block.color?.hex ? theme.palette.getContrastText(props.block.color?.hex) : undefined,
                display       : 'flex',
                alignItems    : 'center',
                flexDirection : 'row',

                '& .MuiCardHeader-subheader' : {
                  color : props.block.color?.hex ? theme.palette.getContrastText(props.block.color?.hex) : undefined,
                }
              } }
              key={ `value-${i}` }
            >
              <Box mr="auto">
                <Typography variant="h5">
                  <Hbs template={ value.display || `{{value}}` } data={ { value : (value.total || 0) } } isInline />
                </Typography>
                <Typography variant="h6">
                  { value.name || value.label }
                </Typography>
              </Box>
              { !!props.block.change && (
                <Typography variant="h6" component="div" sx={ {
                  color      : props.block.color?.hex ? theme.palette.getContrastText(props.block.color?.hex) : undefined,
                  fontWeight : 'bold',
                } }>
                  { (value.last || 0) > (value.current || 0) && (
                    <>
                      -<Hbs template={ value.display || `{{value}}` } data={ { value : (value.last || 0) - (value.current || 0) } } isInline />
                      { ` (-${getDifference((value.last || 0), (value.current || 0))}%) ` }
                    </>
                  ) }
                  { (value.last || 0) < (value.current || 0) && (
                    <>
                      +<Hbs template={ value.display || `{{value}}` } data={ { value : (value.current || 0) - (value.last || 0) } } isInline />
                      { ` (+${getDifference((value.last || 0), (value.current || 0))}%) ` }
                    </>
                  ) }
                  { (value.last || 0) === (value.current || 0) ? `No change` : '' }
                </Typography>
              ) }
            </CardContent>
          );
        })
      ) }
      <CardContent sx={ {
        flex    : 1,
        padding : props.block.minimal ? 0 : undefined,
        display : 'flex',
      } }>
        { loading ? (
          <Box flex={ 1 } display="flex" alignItems="center" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : (
          <Box flex={ 1 } position="relative">
            <Box position="absolute" left={ 0 } right={ 0 } top={ 0 } bottom={ 0 } sx={ {
              '& .apexcharts-svg' : {
                background : 'transparent!important',
              }
            } }>
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