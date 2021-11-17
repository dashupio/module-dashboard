
import moment from 'moment';
import shortid from 'shortid';
import Measure from 'react-measure';
import GridLayout from 'react-grid-layout';
import React, { useState, useEffect } from 'react';
import { Box, Modal, Button, Page, Block, View, Select, Tooltip, IconButton, Icon, Menu, MenuItem } from '@dashup/ui';

// import scss
import './dashboard.scss';

// timeout
let timeout;

// debounce
const debounce = (fn, to = 200) => {
  clearTimeout(timeout);
  timeout = setTimeout(fn, to);
};

// application page
const PageDashboard = (props = {}) => {
  // groups
  const [date, setDate] = useState(new Date());
  const [menu, setMenu] = useState(false);
  const [width, setWidth] = useState(-1);
  const [range, setRange] = useState('month');
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(false);
  const [remove, setRemove] = useState(null);
  const [bConfig, setBConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [rangeMenu, setRangeMenu] = useState(false);

  // default blocks
  const defaultBlocks = [];

  // check blocks
  if (typeof props.page.get('data.blocks') === 'undefined') {
    props.page.set('data.blocks', defaultBlocks);
  }

  // on fields
  const setBlocks = (blocks, prevent = false) => {
    // prevent
    if (!prevent) {
      // on fields
      return props.setData('blocks', [...blocks]);
    } else {
      // without save
      return props.page.set('data.blocks', [...blocks]);
    }
  };

  // set page
  const setBlock = (block, key, value, prevent) => {
    // new blocks
    const newBlocks = props.page.get('data.blocks') || [];

    // updates
    let updates = {
      [key] : value,
    };

    // find field
    const actualBlock = newBlocks.find((b) => b.uuid === block.uuid);

    // fix obj
    if (typeof key === 'object') {
      updates = key;
      prevent = value;
    }

    // set to field
    Object.keys(updates).forEach((k) => {
      block[k] = updates[k];
      actualBlock[k] = updates[k];
    });

    // set date
    setDate(new Date());

    // debounce
    debounce(async () => {
      // loading
      setSaving(true);
      
      // set page
      await setBlocks(newBlocks, prevent);

      // loading
      setSaving(false);
    }, 200);
  };

  // on clone
  const onClone = async (block) => {
    // create block
    const newBlock = {
      ...block,
      uuid  : shortid(),
      _grid : {
        w : 3,
        h : 10,
        x : 0,
        y : (props.page.get('data.blocks') || []).reduce((top, block) => {
          // check above
          if (block?._grid?.w && (block._grid.w + block._grid.y) > top) return (block._grid.w + block._grid.y) + 1;

          // default top
          return top;
        }, 0),
      },
    };
    
    // set page
    setMenu(false);
    await setBlocks([...(props.page.get('data.blocks') || []), newBlock]);
  };

  // create block
  const onCreate = async (type) => {
    // create block
    const newBlock = {
      type,
      uuid  : shortid(),
      _grid : {
        w : 3,
        h : 10,
        x : 0,
        y : (props.page.get('data.blocks') || []).reduce((top, block) => {
          // check above
          if (block?._grid?.w && (block._grid.w + block._grid.y) > top) return (block._grid.w + block._grid.y) + 1;

          // default top
          return top;
        }, 0),
      },
    };
    
    // set page
    setMenu(false);
    await setBlocks([...(props.page.get('data.blocks') || []), newBlock]);
  };

  // on remove
  const onRemove = async (block) => {
    // remove block
    const newBlocks = (props.page.get('data.blocks') || []).filter((b) => b.uuid !== block.uuid);

    // loading
    setRemove(null);
    setSaving(true);
    
    // set page
    await setBlocks(newBlocks);

    // loading
    setSaving(false);
  };

  // on prev
  const onPrev = (e) => {
    // prevent
    e.preventDefault();
    e.stopPropagation();
    
    // check date
    if (range === 'month') {
      // add one month
      return setDate(moment(date).subtract(1, 'month').toDate());
    }
    if (range === 'week') {
      // add one month
      return setDate(moment(date).subtract(1, 'week').toDate());
    }
    if (range === 'day') {
      // add one month
      return setDate(moment(date).subtract(1, 'day').toDate());
    }
  };

  // on next
  const onNext = (e) => {
    // prevent
    e.preventDefault();
    e.stopPropagation();
    
    // check date
    if (range === 'month') {
      // add one month
      return setDate(moment(date).add(1, 'month').toDate());
    }
    if (range === 'week') {
      // add one month
      return setDate(moment(date).add(1, 'week').toDate());
    }
    if (range === 'day') {
      // add one month
      setDate(moment(date).add(1, 'day').toDate());
    }
  };

  // is today
  const isToday = () => {
    // check day
    return moment().format('YYYY-MM-DD') === moment(date).format('YYYY-MM-DD');
  };

  // get props
  const getProps = () => {
    // new props
    const newProps = { ...props };

    // return new props
    delete newProps.view;
    delete newProps.type;
    delete newProps.struct;
    delete newProps.children;

    // return new props
    return newProps;
  };

  // on layout
  const onLayout = (layout) => {
    // new blocks
    const newBlocks = props.page.get('data.blocks');
    let requireUpdate = false;

    // update
    layout.forEach((item) => {
      // find item
      const actualItem = newBlocks.find((b) => b.uuid === item.i);

      // find match
      const shouldUpdate = ['w', 'h', 'x', 'y'].find((key) => {
        return actualItem._grid[key] !== item[key];
      });

      // check return
      if (!shouldUpdate) return;

      // require update
      requireUpdate = true;

      // set values
      actualItem._grid = item;
      delete actualItem._grid.i;
    });

    // save blocks
    if (!requireUpdate) return;

    // set blocks
    setBlocks(newBlocks);
  };

  // get range
  const getRange = () => {
    // return day
    return ['Day', 'Week', 'Month'].map((label) => {
      // return value
      return {
        label,
        value    : label.toLowerCase(),
        selected : range === label.toLowerCase(),
      };
    });
  };

  // use effect
  useEffect(() => {
    // set loading
    setLoading(false);
  }, [props.page.get('_id')]);
  
  // remove jsx
  const removeJsx = remove && (
    <Modal show onHide={ (e) => setRemove(null) }>
      <Modal.Header closeButton>
        <Modal.Title>
          Removing <b>{ remove.label || remove.uuid }</b>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="lead">
          Are you sure you want to remove <b>{ remove.label || 'this Block' }</b>?
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={ (e) => !setRemove(null) && e.preventDefault() }>
          Close
        </Button>
        <Button variant="danger" className="ms-auto" onClick={ (e) => onRemove(remove) }>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );

  // return jsx
  return (
    <Page { ...props } require={ props.require } bodyClass="flex-column">

      <Page.Config show={ config } onHide={ (e) => setConfig(false) } />

      <Page.Menu onConfig={ () => setConfig(true) } presence={ props.presence }>
        { !updating && (
          props.menu ? props.menu({ updating }) : (
            <>
              { !!props.page.get('data.model') && (
                <Box minWidth={ 240 }>
                  <View
                    type="field"
                    view="input"
                    struct="model"

                    field={ {
                      by    : props.page.get('data.by'),
                      label : 'Model',
                      model : props.page.get('data.model'),
                    } }

                    value={ props.item }
                    dashup={ props.dashup }
                    noLabel
                  />
                </Box>
              ) }
            </>
          )
        ) }
        { !props.menu && !updating && (
          <>
            <Button variant="contained" color="primary" onClick={ (e) => setRangeMenu(e.target) }>
              { range }
            </Button>
            <Menu
              open={ !!rangeMenu }
              onClose={ () => setRangeMenu(false) }
              anchorEl={ rangeMenu }
            >
              { getRange().map((option) => {
                // return jsx
                return (
                  <MenuItem key={ option.value } onClick={ () => !setRangeMenu(false) && setRange(option.value) }>
                    { option.label }
                  </MenuItem>
                );
              }) }
            </Menu>
          </>
        ) }
        { !props.menu && !updating && (
          <Button variant="contained" color="primary" disabled={ !!isToday() } onClick={ (e) => setDate(new Date()) }>
            { isToday() ? 'Today' : moment(date).format('LL') }
          </Button>
        ) }
        { !props.menu && !updating && (
          <Box>
            <Tooltip title="Previous">
              <IconButton onClick={ (e) => onPrev(e) }>
                <Icon type="fas" icon="chevron-left" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Next">
              <IconButton onClick={ (e) => onNext(e) }>
                <Icon type="fas" icon="chevron-right" />
              </IconButton>
            </Tooltip>
          </Box>
        ) }

        { updating && props.dashup.can(props.page, 'manage') && (
          <Button variant="contained" color="primary" onClick={ () => setMenu(true) }>
            Add Block
          </Button>
        ) }
        { props.dashup.can(props.page, 'manage') && (
          <Button variant="contained" color={ updating ? 'success' : 'primary' } onClick={ () => setUpdating(!updating) }>
            { updating ? 'Finish' : 'Update View' }
          </Button>
        ) }
      </Page.Menu>
      { !!props.subMenu && props.subMenu({ updating }) }
      <Page.Body>
        <div className="flex-1 fit-content">
          <Measure bounds onResize={ ({ bounds }) => setWidth(parseInt(bounds.width, 10)) }>
            { ({ measureRef }) => {
              // return jsx
              return (
                <div ref={ measureRef }>
                  { width > 0 && (
                    <GridLayout
                      layout={ (props.page.get('data.blocks') || []).map((block) => {
                        // return block
                        return {
                          h : block?._grid?.h || 1,
                          w : block?._grid?.w || 1,
                          y : block?._grid?.y || 0,
                          x : block?._grid?.x || 0,
                          i : block.uuid,
                        };
                      }) }
                      cols={ 12 }
                      width={ width }
                      rowHeight={ 30 }
                      className="layout"
                      isDraggable={ props.dashup.can(props.page, 'manage') && updating }
                      isResizable={ props.dashup.can(props.page, 'manage') && updating }
                      onLayoutChange={ onLayout }
                      containerPadding={ [0, 0] }
                      >
                      { (props.page.get('data.blocks') || []).map((block, i) => {
                        // return block
                        return (
                          <Box key={ block.uuid }>
                            <Block
                              date={ date }
                              block={ block }
                              range={ range }
                              model={ props.page.get('data.model') }
                              onClone={ onClone }
                              updating={ updating }
                              onConfig={ setBConfig }
                              onRemove={ setRemove }
                              setBlock={ setBlock }
                              { ...getProps() }
                            />
                          </Box>
                        );
                      }) }
                    </GridLayout>
                  ) }
                </div>
              );
            } }
          </Measure>
        </div>
        { bConfig && <Block.Config show block={ bConfig } onRemove={ setRemove } model={ props.page.get('data.model') } setBlock={ setBlock } onHide={ () => setBConfig(null) } { ...getProps() } /> }
        <Block.Menu show={ menu } available={ props.available.blocks } onBlock={ onCreate } onHide={ () => setMenu(false) } />
        { removeJsx }
      </Page.Body>
    </Page>
  );
};

// export default
export default PageDashboard;