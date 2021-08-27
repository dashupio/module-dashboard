
// import react
import { Hbs } from '@dashup/ui';
import SimpleBar from 'simplebar-react';
import React, { useState } from 'react';

// create chart block
const BlockCard = (props = {}) => {
  // use state
  const [tab, setTab] = useState(0);

  // return jsx
  return (
    <div className={ `flex-1 d-flex flex-column h-100 w-100${props.block.background ? ' card' : ''}` }>
      <div if={ props.block.name } className={ props.block.background ? 'card-header' : 'mb-2' }>
        <b>{ props.block.name }</b>
      </div>
      { (props.block.tabs || []).length > 1 && (
        <div className={ props.block.background ? 'card-header' : 'd-flex' }>
          <ul className="nav nav-tabs w-100">
            { props.block.tabs.map((t, i) => {
              // return jsx
              return (
                <li key={ `tab-${i}` } className="nav-item">
                  <a className={ `nav-link${tab === i ? ' active' : ''}` } href="#" onClick={ (e) => setTab(i) }>
                    { t.title }
                  </a>
                </li>
              );
            }) }
          </ul>
        </div>
      ) }
      <SimpleBar className={ `flex-column p-relative ${props.block.background ? 'card-body' : 'flex-1'}` }>
        { !!(props.block.tabs || []).length && (
          <Hbs template={ props.block.tabs[tab].display || '' } data={ props.item ? props.item.get() : {} } />
        ) }
      </SimpleBar>
    </div>
  );
};

// export default
export default BlockCard;