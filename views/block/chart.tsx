
// import react
import moment from 'moment';
import { Hbs, Chart } from '@dashup/ui';
import PerfectScrollbar from 'react-perfect-scrollbar';
import React, { useState, useEffect } from 'react';

// create chart block
const BlockChart = (props = { range : 'month', date : new Date() }) => {
  // use state
  const [chart, setChart] = useState({});
  const [loading, setLoading] = useState(true);

  // fix context
  const fixContext = (where) => {
    // tempates
    if (!this.__templates) this.__templates = {};

    // iterate object
    const iter = (obj) => {
      // check keys
      Object.keys(obj).forEach((key) => {
        // iterate sub
        if (typeof obj[key] === 'object') return obj[key] = iter(obj[key]);

        // check string
        if (typeof obj[key] === 'string' && obj[key].includes('{{')) {
          // log context
          if (!this.__templates[obj[key]]) this.__templates[obj[key]] = handlebars.compile(obj[key]);

          // key
          obj[key] = this.__templates[obj[key]](this.props.context);
        }
      });

      // return fixed
      return obj;
    };

    // iterate object
    return iter(where);
  };

  // load chart
  const loadChart = async () => {
    // return nothing
    if (!props.block.model) return {};

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

    // get model
    const model = props.dashup.page(props.block.model);

    // filter
    const filter = typeof props.block.filter === 'string' ? JSON.parse(props.block.filter) : [];

    // get metric
    const metric   = props.block.metric   || 'avg';
    const grouping = props.block.grouping || 'total';

    // get forms
    const forms = props.getForms([model]);
    const fields = props.getFields(forms);

    // get field
    const field = props.block.field ? props.getField(props.block.field, fields) : null;

    // key
    const fieldKey = field ? (field.type === 'date' ? `${(field.name || field.uuid)}.duration` : (field.name || field.uuid)) : null;

    // set type
    let data = null;

    // get query
    const getQuery = () => {
      // create query
      let query = model;

      // check filters
      // @todo
      //filter.forEach((where) => {
      //  query = query.where(fixContext(where));
      //});

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
          last : await fn(
            getQuery()
            .gt(groupKey, moment(props.date).subtract(1, `${props.range}s`).startOf(props.range).toDate())
            .lt(groupKey, moment(props.date).startOf(props.range).toDate())
          ),
          total : await fn(getQuery()),
          current : await fn(
            getQuery()
            .gt(groupKey, moment(props.date).startOf(props.range).toDate())
            .lt(groupKey, moment(props.date).add(1, `${props.range}s`).startOf(props.range).toDate())
          ),
          chart : await Promise.all(loopArr.map(async (i) => {
            return {
              label  : moment(props.date).subtract(i, `${subConfig.sub}s`).startOf(subConfig.sub).toDate(),
              amount : await fn(
                await getQuery()
                .gt(groupKey, moment(props.date).subtract(i, `${subConfig.sub}s`).startOf(subConfig.sub).toDate())
                .lt(groupKey, moment(props.date).subtract((i - 1), `${subConfig.sub}s`).startOf(subConfig.sub).toDate())
              )
            };
          })),
        };
      };

      // get one value...
      if (metric === 'count' || !metric) {
        // set data
        data = await createData((q) => {
          // return counted
          return q.count();
        });
      } else if (!field) {
        // return json
        return;
      } else if (metric === 'sum') {
        // set data
        data = await createData(async (q) => {
          // return counted
          return q.gt(fieldKey, 0).sum(fieldKey) || 0;
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
      }
    }

    // fix nullified values
    if (data.last === null) data.last = 0;
    if (data.total === null) data.total = 0;
    if (data.current === null) data.current = 0;

    // check data
    if (!data) return {};
    
    // return parsed data
    return {
      ...data,

      series : [{
        name : model.get('name'),
        data : data.chart.map((item) => item.amount || 0),
      }],
      options : {
        chart : {
          sparkline : {
            enabled : true
          },
        },
        dataLabels : {
          enabled : false
        },
        stroke : {
          curve : 'smooth'
        },
        fill : {
          opacity : 0.3
        },
        xaxis : {
          type       : 'datetime',
          categories : data.chart.map((item) => `${item.label}`),
          crosshairs : {
            width : 1
          },
        },
        tooltip : {
          x : {
            format : 'dd/MM/yy HH:mm'
          },
        },
      },
    };
  }

  // uc first
  const ucFirst = (str) => {
    // return
    return `${str}`.charAt(0).toUpperCase() + `${str}`.slice(1);
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
    loadChart().then((d) => {
      setChart(d);
      setLoading(false);
    });
  }, [props.page && props.page.get('_id')])

  // return jsx
  return (
    <PerfectScrollbar className="card h-100 p-relative">
      { !!props.block.label && (
        <div className="card-header d-flex">
          { props.block.label }
          <span className="ml-auto">
            { `${props.range === 'day' ? '' : `${ucFirst(props.range)} of `}${moment(props.date).startOf(props.range).format('MMM Do')}` }
          </span>
        </div>
      ) }
      <div className="card-body d-flex flex-0 align-items-center">
        <div className="w-100">
          <div className={ `chart-title text-${props.block.color || 'primary'} text-bold h2 mb-0` } title={ `${props.range === 'day' ? '' : `${ucFirst(props.range)} of `}${moment(props.date).startOf(props.range).format('MMM Do')}` } data-toggle="tooltip">
            <Hbs template={ props.block.display || '{{value}}' } data={ { value : (chart.current || 0) } } isInline />
            { ` this ${props.range}` }
          </div>
          <div className="m-0 text-bold">
            { (chart.last || 0) > (chart.current || 0) && (
              <>
                -<Hbs template={ props.block.display || '{{value}}' } data={ { value : (chart.last || 0) - (chart.current || 0) } } isInline />
                { ` (-${getDifference((chart.last || 0), (chart.current || 0))}%) ` }
              </>
            ) }
            { (chart.last || 0) < (chart.current || 0) && (
              <>
                +<Hbs template={ props.block.display || '{{value}}' } data={ { value : (chart.current || 0) - (chart.last || 0) } } isInline />
                { ` (+${getDifference((chart.last || 0), (chart.current || 0))}%) ` }
              </>
            ) }
            { (chart.last || 0) === (chart.current || 0) ? `No change` : '' }
            { ` since previous ${props.range} ` }
            (<Hbs template={ props.block.display || '{{value}}' } data={ { value : (chart.last || 0) } } isInline />)
          </div>
        </div>
      </div>
      { loading ? (
        <div className="d-flex align-items-center flex-1">
          <div className="w-100 text-center">
            <i className="h1 fa fa-spinner fa-spin" />
          </div>
        </div>
      ) : (
        <div className={ `card-body d-flex flex-column chart-${props.block.color || 'primary'}` }>
          <Chart { ...{
            ...chart
          } } />
        </div>
      ) }
    </PerfectScrollbar>
  );
};

// export default
export default BlockChart;