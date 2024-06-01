// Global initialization

{{
  function string(str) {
    if (str === null) return null

    str = str.trim()

    if (str.length === 0) str = null

    return str
  }

  function boolean(v) {
    return v === true || v === 'true'
  }

  function integer(str) {
    return str === null
      ? null
      : Number.parseInt(str)
  }

  function float(str) {
    return str === null
      ? null
      : Number.parseFloat(str)
  }

  function binary(str) {
    return str === null
      ? null
      : Number.parseInt(str, 2)
  }

  function date(str) {
    return str === null
      ? null
      : new Date(str)
  }

  const KM_TO_MILES = 0.62137119223733

  const milesFromKm = value => Math.trunc(value * KM_TO_MILES)

  const kmFromMiles = value => Math.trunc(value / KM_TO_MILES)
}}
