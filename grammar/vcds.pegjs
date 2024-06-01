// VCDS rules

VersionSpecifier 'a VCDS version specifier'
  = $(DEC+ '.' DEC+ '.' DEC+ '.' DEC+)

DataVersionDate 'a VCDS data version date'
  = $DEC|8|

DataVersionSpecifier 'a VCDS data version specifier'
  = $('DS' DEC|3| '.' DEC)


ModuleAddress 'a module address' = $HEX|2|

CodingValue 'a coding value' = $HEX+

Vcid 'a VCID (Vag-Com identifier)' = $(HEX|18| '-' HEX|4|)

Vinid 'a VINID' = $HEX|34|

Readiness 'readiness flags' = $(BIN|4| _ BIN|4|)

/*
  Module status
  =============
  0000  OK
  0010  Malfunction
  1000  Sporadic communication error
  1100  Cannot be reached
*/
ModuleStatusLabel
  = 'OK'
  / 'Malfunction'
  / 'Sporadic communication error'
  / 'Cannot be reached'
