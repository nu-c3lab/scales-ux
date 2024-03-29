import React, { FunctionComponent, useState, useEffect } from "react";
import { Dropdown } from "react-bootstrap";
import ReactSelect from "react-select";
import "./Filters.scss";

type FilterColumn = {
  key: string;
  nicename: string;
};

type FilterTypeProps = {
  filter: any;
  filters: any;
  setFilter: any;
  getFiltersNormalized: any;
  getFilterOptionsByKey: any;
}

const FilterTypeDropDown: FunctionComponent<FilterTypeProps> = (props) => {
  const { filter,
    filters,
    getFiltersNormalized,
    getFilterOptionsByKey,
    setFilter } = props;
  const { id, type } = filter;

  const filterOptions = getFilterOptionsByKey(type);

  const [filterInput, setFilterInput] = useState<FilterColumn>({
    key: type,
    nicename: filterOptions?.nicename,
  });

  useEffect(() => {
    try {
      if (filterInput) {
        setFilter({ ...filter, type: filterInput.key });
      }
    } catch (error) {
      console.log(error);
    }
  }, [filterInput]);

  const filtersToRender = getFiltersNormalized()?.map((filterInput) => {
    const { allowMultiple, key } = filterInput;
    if (
      allowMultiple === false &&
      filters.some((filter: any) => filter.type === key)
    ) {
      return { ...filterInput, disabled: true };
    }

    return filterInput;
  });

  // console.log(filtersToRender);

  return (
    <>
      <Dropdown className="filter-type-dropdown">
        <Dropdown.Toggle
          size="sm"
          variant="link"
          className="shadow-none text-decoration-none small"
        >
          {filterInput?.nicename || ""}
        </Dropdown.Toggle>

        <Dropdown.Menu className="filter-type-dropdown">
          <Dropdown.ItemText className="text-muted fs-6 ms-3">
            <small>Select a filter type...</small>
          </Dropdown.ItemText>
          {filtersToRender?.map(({ key, nicename, desc, disabled }) => (
            <React.Fragment key={key}>
              <Dropdown.Divider />
              <Dropdown.Item
                onClick={() => setFilterInput({ key, nicename })}
                disabled={disabled}
              >
                <Dropdown.ItemText className={disabled ? "text-muted" : ""}>
                  {nicename}
                </Dropdown.ItemText>
                {desc && (
                  <Dropdown.ItemText className="text-muted fs-6">
                    <small>{desc}</small>
                  </Dropdown.ItemText>
                )}
              </Dropdown.Item>
            </React.Fragment>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
};

export default FilterTypeDropDown;
