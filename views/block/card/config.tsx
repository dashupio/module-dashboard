
// import react
import React from 'react';
import { Box, Button, View, Card, CardHeader, CardContent, IconButton, Icon, TextField } from '@dashup/ui';

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
  const onName = (e, tab) => {
    // set value
    tab.name = e.target.value;

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

  // on display
  const onOpen = (tab, value) => {
    // set display
    tab.open = value;
    
    // set color
    setBlock('tabs', props.block.tabs);
  };

  // return jsx
  return (
    <>
      { (props.block.tabs || []).map((tab, i) => {
        // return jsx
        return (
          <Card key={ `tab-${i}` } sx={ {
            mb : 2,
          } } variant="outlined">
            <CardHeader
              title={ tab.name || `Tab #${i + 1}` }
              action={ (
                <>
                  <IconButton onClick={ (e) => onOpen(tab, !tab.open) }>
                    <Icon type="fas" icon={ tab.open ? 'times' : 'pencil' } />
                  </IconButton>
                  <IconButton onClick={ (e) => onRemove(e, i) } color="error">
                    <Icon type="fas" icon="trash" />
                  </IconButton>
                </>
              ) }
            />
            { tab.open && (
              <CardContent>
                <TextField
                  label="Tab Name"
                  value={ tab.name }
                  onChange={ (e) => onName(e, tab) }
                  fullWidth
                />
                <View
                  type="field"
                  view="input"
                  mode="handlebars"
                  struct="code"
                  field={ {
                    label : 'Display',
                  } }
                  value={ tab.display }
                  dashup={ props.dashup }
                  onChange={ (f, val) => onDisplay(tab, val) }
                  />
              </CardContent>
            ) }
            <Box />
          </Card>
        );
      }) }

      <Box textAlign="right">
        <Button color="success"  onClick={ (e) => onCreate(e) }>
          Add Tab
        </Button>
      </Box>
    </>
  );
}

// export default
export default BlockChartConfig;