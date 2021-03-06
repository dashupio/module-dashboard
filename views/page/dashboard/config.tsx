
// import react
import React from 'react';
import { Query, Select } from '@dashup/ui';

// create page model config
const PageDashboardConfig = (props = {}) => {

  // get dashboards
  const getModels = () => {
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

        selected : (props.page.get('data.model') || []).includes(model.get('_id')),
      };
    });
  };

  // get forms
  const getForms = () => {
    // get forms
    const forms = Array.from(props.dashup.get('pages').values()).filter((page) => {
      // return model pages
      return page.get('type') === 'form' && page.get('data.model') === props.page.get('data.model') && !page.get('archived');
    });

    // return mapped
    return forms.map((form) => {
      // return values
      return {
        value : form.get('_id'),
        label : form.get('name'),

        selected : (props.page.get('data.forms') || []).includes(form.get('_id')),
      };
    });
  };
  
  // get field
  const getField = (tld, types = []) => {
    // return value
    return props.getFields().map((field) => {
      // check type
      if (types.length && !types.includes(field.type)) return;

      // return fields
      return {
        label : field.label || field.name,
        value : field.uuid,

        selected : (props.page.get(`data.${tld}`) || []).includes(field.uuid),
      };
    }).filter((f) => f);
  };

  // on forms
  const onModel = (value) => {
    // set data
    props.setData('model', value?.value);
  };

  // on forms
  const onField = (tld, value) => {
    // set data
    props.setData(tld, value || null);
  };

  // on forms
  const onForms = (value) => {
    // set data
    props.setData('forms', value.map((v) => v.value));
  };

  // return jsx
  return (
    <>
      <div className="mb-3">
        <label className="form-label">
          Choose Model
        </label>
        <Select options={ getModels() } defaultValue={ getModels().filter((f) => f.selected) } onChange={ onModel } isClearable />
        <small>
          View Dashboards with this grids items.
        </small>
      </div>

      { !!props.page.get('data.model') && (
        <div className="mb-3">
          <label className="form-label">
            Model Form(s)
          </label>
          <Select options={ getForms() } defaultValue={ getForms().filter((f) => f.selected) } onChange={ onForms } isMulti />
          <small>
            The forms that this grid will filter by.
          </small>
        </div>
      ) }

      { !!props.page.get('data.model') && props.getFields && !!props.getFields().length && (
        <>
          <hr />
            
          <div className="mb-3">
            <label className="form-label">
              Model Title Field
            </label>
            <Select options={ getField('by') } defaultValue={ getField('by').filter((f) => f.selected) } onChange={ (value) => onField('by', value?.value) } isClearable />
            <small>
              Selecting a tag field will group the grid by this field.
            </small>
          </div>
            
          <div className="mb-3">
            <label className="form-label">
              Filter By
            </label>
            <Query
              isString

              page={ props.page }
              query={ props.page.get('data.filter') }
              dashup={ props.dashup }
              fields={ props.getFields() }
              onChange={ (val) => props.setData('filter', val) }
              getFieldStruct={ props.getFieldStruct }
              />
          </div>
        </>
      ) }
    </>
  )
};

// export default
export default PageDashboardConfig;