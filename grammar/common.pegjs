// Numbers
Integer 'an integer'
  = DEC+
  { return integer(text()) }

Decimal 'a decimal number'
  = $(DEC+ '.' DEC+)
  { return float(text()) }

// Filesystem
Filename 'a filename' = $[0-9a-z.-]i+

// Helpers
l 'an empty line' = _* EOL
rol 'the rest of the line' = [^\r]*
