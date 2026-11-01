import FormField from './FormField.jsx'
import { REGIONS, SPECIES } from '../utils/trees.js'

export default function TreeFilters({ controls }) {
  const { filters, years, change, reset } = controls
  return (
    <div className="tree-filters" role="group" aria-label="Tree filters">
      <FormField
        label="Search trees"
        name="search"
        type="search"
        placeholder="Name, region, tree ID…"
        value={filters.search}
        onChange={change}
      />
      <FormField
        label="Region"
        name="region"
        value={filters.region}
        onChange={change}
      >
        <option value="">All regions</option>
        {REGIONS.map((region) => (
          <option key={region.id} value={region.id}>
            {region.name}
          </option>
        ))}
      </FormField>
      <FormField
        label="Tree species"
        name="species"
        value={filters.species}
        onChange={change}
      >
        <option value="">All species</option>
        {SPECIES.map((name) => (
          <option key={name}>{name}</option>
        ))}
      </FormField>
      <FormField
        label="Year"
        name="year"
        value={filters.year}
        onChange={change}
      >
        <option value="">All years</option>
        {years.map((year) => (
          <option key={year}>{year}</option>
        ))}
      </FormField>
      <button type="button" className="reset-filters" onClick={reset}>
        Reset filters
      </button>
    </div>
  )
}
