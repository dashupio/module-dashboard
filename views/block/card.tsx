
// import react
import SimpleBar from 'simplebar-react';
import React, { useState } from 'react';
import { Box, Hbs, Card, CardHeader, CardContent, Tab, TabContext, TabList, TabPanel } from '@dashup/ui';

// create chart block
const BlockCard = (props = {}) => {
  // use state
  const [tab, setTab] = useState(`${0}`);

  // tabs
  const tabs = (props.block.tabs || []);
  
  // return jsx
  return (
    <Card sx={ {
      width         : '100%',
      height        : '100%',
      display       : 'flex',
      flexDirection : 'column',
    } }>
      { !!props.block.name && (
        <CardHeader
          title={ props.block.name }
        />
      ) }
      <CardContent sx={ {
        flex : 1,
      } }>
        <TabContext value={ tab }>
          <Box sx={ { borderBottom : 1, borderColor : 'divider', mb : 2 } }>
            <TabList onChange={ (e, v) => setTab(`${v}`) }>
              { tabs.map((t, i) => {
                // return jsx
                return <Tab key={ `title-${i}` } value={ `${i}` } label={ t.name || t.title || `Tab #${i + 1}` } />;
              }) }
            </TabList>
          </Box>
          { tabs.map((t, i) => {
            // return jsx
            return (
              <TabPanel key={ `tab-${i}` } value={ `${i}` } sx={ {
                flex         : 1,
                position     : 'relative',
                paddingLeft  : 0,
                paddingRight : 0,
              } }>
                <Box position="absolute" top={ 0 } left={ 0 } right={ 0 } bottom={ 0 }>
                  <SimpleBar style={ {
                    width  : '100%',
                    height : '100%',
                  } }>
                    <Hbs template={ t.display || '' } data={ props.item ? props.item.get() : {} } />
                  </SimpleBar>
                </Box>
              </TabPanel>
            );
          }) }
        </TabContext>
      </CardContent>
      <Box />
    </Card>
  );
};

// export default
export default BlockCard;